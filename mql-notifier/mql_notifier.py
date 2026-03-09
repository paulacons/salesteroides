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
SLACK_CHANNEL_PARTNERSHIPS = os.environ.get("SLACK_CHANNEL_PARTNERSHIPS", "")

HUBSPOT_SEARCH_URL = "https://api.hubapi.com/crm/v3/objects/contacts/search"
HUBSPOT_OWNERS_URL = "https://api.hubapi.com/crm/v3/owners"
SLACK_POST_URL = "https://slack.com/api/chat.postMessage"

PAGE_SIZE = 100
API_DELAY = 0.15  # 150 ms entre llamadas a HubSpot

MADRID_TZ = timezone(timedelta(hours=1))  # CET base — se ajusta abajo

# Solo mostrar estos SDRs en el reporte
ALLOWED_OWNERS = {
    "Gelia Pereira",
    "Santiago Rodríguez",
    "Carmen Báscones",
    "Paula Serrats",
    "Lucas Abad Revert",
    "Álvaro Cabal García",
    "Jorge Latorre Escudero",
}

# Owners de Partnerships
PARTNERSHIPS_OWNERS = {
    "Tomás Lemus",
    "Laszlo Bene",
    "Francisco Gost Scagliarini",
}

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
    """Devuelve lista de contactos MQL sin contactar desde su MQL date."""
    all_mqls = []
    after = 0
    body = {
        "filterGroups": [
            {
                "filters": [
                    {
                        "propertyName": "hs_lead_status",
                        "operator": "EQ",
                        "value": "MQL",
                    },
                ]
            }
        ],
        "properties": [
            "firstname", "lastname", "email", "hubspot_owner_id",
            "notes_last_contacted",
            "hs_lifecyclestage_marketingqualifiedlead_date",
        ],
        "limit": PAGE_SIZE,
    }

    while True:
        if after:
            body["after"] = after
        data = hubspot_post(HUBSPOT_SEARCH_URL, body)
        results = data.get("results", [])
        all_mqls.extend(results)
        log.info("MQLs obtenidos: %d (acumulado: %d)", len(results), len(all_mqls))
        after = data.get("paging", {}).get("next", {}).get("after")
        if not after:
            break

    # Filtrar: sin contacto desde la MQL date
    pending = []
    for contact in all_mqls:
        props = contact.get("properties", {})
        mql_date_str = props.get("hs_lifecyclestage_marketingqualifiedlead_date")
        last_contacted_str = props.get("notes_last_contacted")

        if not mql_date_str:
            continue

        # Sin contacto nunca → pendiente
        if not last_contacted_str:
            pending.append(contact)
            continue

        # Comparar fechas: si último contacto es anterior a MQL date → pendiente
        try:
            mql_date = datetime.fromisoformat(mql_date_str.replace("Z", "+00:00"))
            last_contacted = datetime.fromisoformat(last_contacted_str.replace("Z", "+00:00"))
            if last_contacted < mql_date:
                pending.append(contact)
        except (ValueError, TypeError):
            pending.append(contact)

    log.info("MQLs sin contacto desde MQL date: %d / %d", len(pending), len(all_mqls))
    return pending

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
    lines.append("<https://app.hubspot.com/contacts/20392666/objects/0-1/views/61811688/list|Ver en HubSpot>")
    lines.append("")
    lines.append("_Datos: HubSpot · hs_lead_status = MQL · sin contacto desde MQL date_")
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
    if not SLACK_CHANNEL_PARTNERSHIPS:
        missing.append("SLACK_CHANNEL_PARTNERSHIPS")
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

    # 3. Filtrar solo owners permitidos (SDRs)
    allowed_ids = set()
    for oid, name in owners.items():
        if name in ALLOWED_OWNERS:
            allowed_ids.add(oid)
    log.info("Owners SDR filtrados: %s", {oid: owners[oid] for oid in allowed_ids})

    grouped = {}  # owner_id -> [contacts]
    for contact in mqls:
        props = contact.get("properties", {})
        owner_id = props.get("hubspot_owner_id") or None
        if owner_id not in allowed_ids:
            continue
        grouped.setdefault(owner_id, []).append(contact)

    no_call_total = sum(len(v) for v in grouped.values())
    log.info("MQLs sin llamada (SDR): %d", no_call_total)

    # 4. Construir y enviar mensaje SDR
    message = build_message(grouped, owners, today_str)
    log.info("Mensaje SDR:\n%s", message)
    slack_post(SLACK_CHANNEL, message)

    # 5. Filtrar owners de Partnerships
    partnerships_ids = set()
    for oid, name in owners.items():
        if name in PARTNERSHIPS_OWNERS:
            partnerships_ids.add(oid)
    log.info("Owners Partnerships filtrados: %s", {oid: owners[oid] for oid in partnerships_ids})

    grouped_partnerships = {}
    for contact in mqls:
        props = contact.get("properties", {})
        owner_id = props.get("hubspot_owner_id") or None
        if owner_id not in partnerships_ids:
            continue
        grouped_partnerships.setdefault(owner_id, []).append(contact)

    no_call_partnerships = sum(len(v) for v in grouped_partnerships.values())
    log.info("MQLs sin llamada (Partnerships): %d", no_call_partnerships)

    # 6. Construir y enviar mensaje Partnerships
    message_partnerships = build_message(grouped_partnerships, owners, today_str)
    log.info("Mensaje Partnerships:\n%s", message_partnerships)
    slack_post(SLACK_CHANNEL_PARTNERSHIPS, message_partnerships)

    log.info("=== MQL Notifier finalizado ===")


if __name__ == "__main__":
    main()
