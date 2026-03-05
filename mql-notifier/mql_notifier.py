#!/usr/bin/env python3
"""
MQL Notifier — Consulta HubSpot para MQLs sin llamadas y notifica por Slack.
Se ejecuta como usuario real (xoxp- token), no como bot.
"""

import json
import logging
import os
import sys
import time
from datetime import datetime, timezone, timedelta
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
HUBSPOT_TOKEN = os.environ.get("HUBSPOT_ACCESS_TOKEN", "")
SLACK_TOKEN = os.environ.get("SLACK_USER_TOKEN", "")
SLACK_CHANNEL = os.environ.get("SLACK_CHANNEL", "")

HUBSPOT_SEARCH_URL = "https://api.hubapi.com/crm/v3/objects/contacts/search"
HUBSPOT_OWNERS_URL = "https://api.hubapi.com/crm/v3/owners"
SLACK_POST_URL = "https://slack.com/api/chat.postMessage"

PAGE_SIZE = 100
API_DELAY = 0.15  # 150 ms entre llamadas a HubSpot

MADRID_TZ = timezone(timedelta(hours=1))  # CET base — se ajusta abajo

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helpers HTTP (solo stdlib)
# ---------------------------------------------------------------------------

def _request(method, url, headers=None, body=None):
    """Hace una petición HTTP y devuelve el JSON parseado."""
    headers = headers or {}
    data = json.dumps(body).encode() if body else None
    if data and "Content-Type" not in headers:
        headers["Content-Type"] = "application/json"
    req = Request(url, data=data, headers=headers, method=method)
    try:
        with urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except HTTPError as e:
        error_body = e.read().decode() if e.fp else ""
        log.error("HTTP %s %s → %s: %s", method, url, e.code, error_body)
        raise


def hubspot_get(url, params=None):
    if params:
        url = f"{url}?{urlencode(params)}"
    headers = {"Authorization": f"Bearer {HUBSPOT_TOKEN}"}
    time.sleep(API_DELAY)
    return _request("GET", url, headers=headers)


def hubspot_post(url, body):
    headers = {"Authorization": f"Bearer {HUBSPOT_TOKEN}"}
    time.sleep(API_DELAY)
    return _request("POST", url, headers=headers, body=body)


def slack_post(channel, text):
    headers = {
        "Authorization": f"Bearer {SLACK_TOKEN}",
        "Content-Type": "application/json; charset=utf-8",
    }
    body = {"channel": channel, "text": text}
    resp = _request("POST", SLACK_POST_URL, headers=headers, body=body)
    if not resp.get("ok"):
        log.error("Slack error: %s", resp.get("error", resp))
        sys.exit(1)
    log.info("Mensaje enviado a Slack correctamente.")
    return resp

# ---------------------------------------------------------------------------
# Deduplicación: si ya se envió hoy, salimos
# ---------------------------------------------------------------------------

def already_sent_today():
    """Comprueba si ya se ejecutó hoy (para evitar duplicados por doble cron DST)."""
    flag = os.environ.get("GITHUB_WORKSPACE", "/tmp") + "/.mql_sent_flag"
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if os.path.exists(flag):
        with open(flag) as f:
            if f.read().strip() == today:
                return True
    with open(flag, "w") as f:
        f.write(today)
    return False

# ---------------------------------------------------------------------------
# HubSpot: obtener owners
# ---------------------------------------------------------------------------

def get_owners():
    """Devuelve dict {owner_id: nombre}."""
    owners = {}
    after = None
    while True:
        params = {"limit": 100}
        if after:
            params["after"] = after
        data = hubspot_get(HUBSPOT_OWNERS_URL, params)
        for o in data.get("results", []):
            first = o.get("firstName", "")
            last = o.get("lastName", "")
            name = f"{first} {last}".strip() or o.get("email", f"Owner {o['id']}")
            owners[o["id"]] = name
        after = data.get("paging", {}).get("next", {}).get("after")
        if not after:
            break
    log.info("Owners cargados: %d", len(owners))
    return owners

# ---------------------------------------------------------------------------
# HubSpot: buscar MQLs
# ---------------------------------------------------------------------------

def search_mqls():
    """Devuelve lista de contactos con hs_lead_status = MQL."""
    contacts = []
    after = 0
    body = {
        "filterGroups": [
            {
                "filters": [
                    {
                        "propertyName": "hs_lead_status",
                        "operator": "EQ",
                        "value": "MQL",
                    }
                ]
            }
        ],
        "properties": ["firstname", "lastname", "email", "hubspot_owner_id"],
        "limit": PAGE_SIZE,
    }

    while True:
        if after:
            body["after"] = after
        data = hubspot_post(HUBSPOT_SEARCH_URL, body)
        results = data.get("results", [])
        contacts.extend(results)
        log.info("MQLs obtenidos: %d (acumulado: %d)", len(results), len(contacts))
        after = data.get("paging", {}).get("next", {}).get("after")
        if not after:
            break

    return contacts

# ---------------------------------------------------------------------------
# HubSpot: comprobar llamadas asociadas a un contacto
# ---------------------------------------------------------------------------

def contact_has_calls(contact_id):
    """Devuelve True si el contacto tiene al menos un engagement de tipo CALL.

    Usa la Engagements API v1, que NO requiere scope de calls.
    Solo necesita crm.objects.contacts.read.
    """
    url = (
        f"https://api.hubapi.com/engagements/v1/engagements/associated/CONTACT"
        f"/{contact_id}/paged"
    )
    try:
        data = hubspot_get(url, {"limit": 100})
        for eng in data.get("results", []):
            if eng.get("engagement", {}).get("type") == "CALL":
                return True
        return False
    except HTTPError as e:
        if e.code == 404:
            return False
        raise

# ---------------------------------------------------------------------------
# Formatear mensaje Slack
# ---------------------------------------------------------------------------

def build_message(grouped, owners, today_str):
    total = sum(len(v) for v in grouped.values())

    if total == 0:
        return (
            f"\u2705 *MQLs sin llamada — {today_str}*\n"
            f"Todo bajo control: no hay MQLs pendientes de primer contacto."
        )

    lines = [
        f"\U0001f4cb *MQLs sin llamada — {today_str}*",
        f"Total: *{total}* pendientes de primer contacto",
        "",
    ]

    # Ordenar por cantidad descendente
    sorted_owners = sorted(grouped.items(), key=lambda x: len(x[1]), reverse=True)

    for owner_id, contacts in sorted_owners:
        count = len(contacts)
        name = owners.get(owner_id, "Sin asignar") if owner_id else "Sin asignar"
        if count >= 10:
            emoji = "\U0001f534"   # 🔴
        elif count >= 5:
            emoji = "\U0001f7e1"   # 🟡
        else:
            emoji = "\U0001f7e2"   # 🟢
        lines.append(f"{emoji} *{name}*: {count} MQLs sin llamar")

    lines.append("")
    lines.append("_Datos: HubSpot · hs_lead_status = MQL · sin actividad de llamada_")
    lines.append("\U0001f534 \u226510 · \U0001f7e1 \u22655 · \U0001f7e2 <5")

    return "\n".join(lines)

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    # Validar env vars
    missing = []
    if not HUBSPOT_TOKEN:
        missing.append("HUBSPOT_ACCESS_TOKEN")
    if not SLACK_TOKEN:
        missing.append("SLACK_USER_TOKEN")
    if not SLACK_CHANNEL:
        missing.append("SLACK_CHANNEL")
    if missing:
        log.error("Faltan variables de entorno: %s", ", ".join(missing))
        sys.exit(1)

    # Deduplicación DST
    if already_sent_today():
        log.info("Ya se envió la notificación hoy. Saliendo (dedup DST).")
        return

    log.info("=== MQL Notifier iniciado ===")

    # Fecha Madrid
    # Detectar si estamos en CEST (último domingo de marzo → último domingo de octubre)
    now_utc = datetime.now(timezone.utc)
    # Simplificación: usamos la hora UTC para mostrar la fecha en Madrid
    madrid_offset = timedelta(hours=1)  # CET
    month = now_utc.month
    if 4 <= month <= 9:
        madrid_offset = timedelta(hours=2)  # CEST seguro
    elif month == 3:
        # Último domingo de marzo
        last_day = 31
        while datetime(now_utc.year, 3, last_day).weekday() != 6:
            last_day -= 1
        if now_utc.day >= last_day:
            madrid_offset = timedelta(hours=2)
    elif month == 10:
        last_day = 31
        while datetime(now_utc.year, 10, last_day).weekday() != 6:
            last_day -= 1
        if now_utc.day < last_day:
            madrid_offset = timedelta(hours=2)

    now_madrid = now_utc + madrid_offset
    today_str = now_madrid.strftime("%d/%m/%Y")
    log.info("Fecha Madrid: %s", today_str)

    # 1. Obtener owners
    owners = get_owners()

    # 2. Buscar MQLs
    mqls = search_mqls()
    log.info("Total MQLs encontrados: %d", len(mqls))

    # 3. Filtrar los que NO tienen llamadas
    grouped = {}  # owner_id -> [contacts]
    for contact in mqls:
        cid = contact["id"]
        has_calls = contact_has_calls(cid)
        if has_calls:
            continue

        props = contact.get("properties", {})
        owner_id = props.get("hubspot_owner_id") or None
        grouped.setdefault(owner_id, []).append(contact)

    no_call_total = sum(len(v) for v in grouped.values())
    log.info("MQLs sin llamada: %d", no_call_total)

    # 4. Construir y enviar mensaje
    message = build_message(grouped, owners, today_str)
    log.info("Mensaje:\n%s", message)
    slack_post(SLACK_CHANNEL, message)

    log.info("=== MQL Notifier finalizado ===")


if __name__ == "__main__":
    main()
