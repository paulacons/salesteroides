# MQL Notifier

Notificación diaria en Slack con los MQLs de HubSpot que no tienen ninguna llamada asociada, agrupados por SDR (owner).

Se envía como **usuario real** (Slack User Token), no como bot.

---

## Cómo funciona

1. Consulta HubSpot CRM por contactos con `hs_lead_status = MQL`
2. Para cada contacto, comprueba si tiene actividades de llamada asociadas
3. Agrupa los que no tienen llamadas por `hubspot_owner_id`
4. Envía un resumen al canal de Slack `#mktsales-team`

## Ejemplo de mensaje

```
📋 MQLs sin llamada — 05/03/2026
Total: 23 pendientes de primer contacto

🔴 Ana García: 12 MQLs sin llamar
🟡 Pedro Martín: 7 MQLs sin llamar
🟢 Laura Sánchez: 4 MQLs sin llamar

Datos: HubSpot · hs_lead_status = MQL · sin actividad de llamada
🔴 ≥10 · 🟡 ≥5 · 🟢 <5
```

---

## Setup paso a paso

### 1. HubSpot Private App Token

1. Ve a **HubSpot → Settings → Integrations → Private Apps**
2. Crea una nueva app (o usa una existente)
3. Asigna estos scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.owners.read`
4. Copia el token (`pat-...`)

### 2. Slack User Token (envío como usuario real)

> **Importante:** Usamos un User Token (`xoxp-...`), NO un Bot Token (`xoxb-...`), para que el mensaje aparezca enviado por tu usuario.

1. Ve a [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → From scratch
2. Nombre: `MQL Notifier` (o el que quieras), workspace: el tuyo
3. En el menú lateral: **OAuth & Permissions**
4. Baja a **User Token Scopes** (NO Bot Token Scopes) y añade:
   - `chat:write`
5. Sube a **Install to Workspace** → Autoriza
6. Copia el **User OAuth Token** (`xoxp-...`)

### 3. Channel ID de Slack

1. En Slack, haz clic derecho en `#mktsales-team` → **View channel details**
2. Al final del modal verás el **Channel ID** (algo como `C0XXXXXXX`)

### 4. GitHub Secrets

En tu repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret                 | Valor                          |
|------------------------|--------------------------------|
| `HUBSPOT_ACCESS_TOKEN` | `pat-...` (token de HubSpot)   |
| `SLACK_USER_TOKEN`     | `xoxp-...` (User OAuth Token)  |
| `SLACK_CHANNEL`        | `C0XXXXXXX` (Channel ID)       |

### 5. Deploy

Sube los archivos al repo:

```
mql_notifier.py
.github/workflows/mql-notifier.yml
```

El workflow se ejecutará automáticamente de lunes a viernes a las 10:00 hora de Madrid.

### 6. Test manual

Ve a **Actions → MQL Notifier → Run workflow** para probarlo manualmente.

---

## Horario y DST

El cron de GitHub Actions usa UTC. Para que siempre sean las 10:00 en Madrid:

- `0 8 * * 1-5` → 10:00 en verano (CEST = UTC+2)
- `0 9 * * 1-5` → 10:00 en invierno (CET = UTC+1)

Ambas entradas están activas. El script incluye deduplicación: si se ejecuta dos veces el mismo día, la segunda ejecución se salta.

---

## Stack

- Python 3.12 — solo `urllib` de la stdlib, sin dependencias externas
- GitHub Actions con cron schedule
- HubSpot CRM API v3
- Slack Web API (`chat.postMessage`)
