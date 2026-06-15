# B-Funds — Backend (NestJS)

API del Gestor de Recursos Externos. Swagger en `/api/docs`.

## Configuración

```bash
cp .env.example .env
npm install
npm run start:dev
```

Variables principales: `PORT`, `CORS_ORIGIN`, `DATABASE_LOCATION`. Ver `.env.example`.

## Scripts

```bash
npm run start:dev   # desarrollo con watch
npm run build       # compilar
npm run start:prod  # producción (dist/main)
npm run seed        # datos demo
```

## Alertas — notificaciones por correo (Microsoft 365)

El módulo de Alertas (`src/modules/alerts/`) usa `EmailService` con modos **MOCK** y **SMTP**.

### Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `ALERT_EMAIL_MODE` | `MOCK` (default) o `SMTP` |
| `SMTP_HOST` | `smtp.office365.com` para Microsoft 365 / Outlook |
| `SMTP_PORT` | `587` (STARTTLS) |
| `SMTP_SECURE` | `false` para puerto 587 |
| `SMTP_USER` | Cuenta emisora autorizada por IT |
| `SMTP_PASS` | Credencial de la cuenta (no versionar) |
| `SMTP_FROM` | Remitente visible, p. ej. `"B-Funds Alerts <no-reply@belcorp.biz>"` |
| `ALERT_EMAIL_ALLOWLIST` | Correos permitidos, separados por coma. Vacío = no envío real en SMTP |
| `ALERT_EMAIL_TEST_RECIPIENT` | Redirige todos los envíos a este correo en pruebas |

Ejemplo en `.env.example` (valores seguros para el repo):

```env
ALERT_EMAIL_MODE=MOCK
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM="B-Funds Alerts <no-reply@belcorp.biz>"
ALERT_EMAIL_ALLOWLIST=
ALERT_EMAIL_TEST_RECIPIENT=
```

### Desarrollo local (MOCK)

- Las alertas se procesan y persisten con `status = MOCKED`.
- `POST /api/alerts/run-validation` y `POST /api/alerts/test-email` **no envían correos reales**.
- No se requiere configuración SMTP.

### Prueba controlada de envío (solo `.env` local)

Si necesitas validar SMTP con Microsoft 365, configura **únicamente en tu `.env` local**:

```env
ALERT_EMAIL_MODE=SMTP
SMTP_USER=tu-buzon@belcorp.biz
SMTP_PASS=***
ALERT_EMAIL_TEST_RECIPIENT=tu-correo-corporativo
ALERT_EMAIL_ALLOWLIST=tu-correo-corporativo
```

Usa **Probar correo** en la UI (`POST /api/alerts/test-email`) antes de ejecutar validaciones masivas.

### Producción

- Coordinar con **IT** un buzón emisor autorizado.
- Confirmar que **SMTP AUTH** está habilitado para esa cuenta, o evaluar alternativas: **Microsoft Graph API**, **Power Automate**, **Workato**.
- Mantener `ALERT_EMAIL_ALLOWLIST` acotada durante pruebas.
- **Nunca** commitear `.env`, contraseñas ni secretos.

### Endpoints de alertas

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/alerts/run-validation` | Detecta riesgos y crea alertas (idempotente por día) |
| GET | `/api/alerts` | Lista alertas visibles por rol |
| GET | `/api/alerts/summary` | Resumen por tipo y estado |
| POST | `/api/alerts/test-email` | Correo de prueba sin crear alerta |

Header demo: `x-demo-user` (ver Swagger).
