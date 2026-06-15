# B-Funds — Gestor de Recursos Externos

Monorepo con backend NestJS y frontend React/Vite para gestionar recursos externos, vencimientos, presupuesto, órdenes de compra y alertas.

## Estructura

| Carpeta | Descripción |
|---------|-------------|
| `gestor-recursos-backend/` | API NestJS + SQLite (sql.js) |
| `gestor-recursos-frontend/` | SPA React + Vite |

## Inicio rápido

```bash
# Backend
cd gestor-recursos-backend
cp .env.example .env
npm install
npm run start:dev

# Frontend (otra terminal)
cd gestor-recursos-frontend
cp .env.example .env
npm install
npm run dev
```

Swagger: `http://localhost:3000/api/docs`

## Alertas y correo (Microsoft 365)

El módulo de Alertas incluye `EmailService` con dos modos:

| Modo | Comportamiento |
|------|----------------|
| `MOCK` (default) | No envía correos reales. Las alertas se guardan con `status = MOCKED`. |
| `SMTP` | Envía correo vía SMTP corporativo (Microsoft 365 / Outlook). |

### Desarrollo local

Por defecto, `ALERT_EMAIL_MODE=MOCK`. Las alertas y el botón **Probar correo** funcionan sin enviar mensajes reales.

Copia `gestor-recursos-backend/.env.example` a `.env` y mantén `ALERT_EMAIL_MODE=MOCK`.

### Envío real con Microsoft 365

Para pruebas controladas en local (solo en tu `.env`, nunca en el repo):

```env
ALERT_EMAIL_MODE=SMTP
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-buzon@belcorp.biz
SMTP_PASS=tu-contraseña-o-app-password
SMTP_FROM="B-Funds Alerts <no-reply@belcorp.biz>"
ALERT_EMAIL_TEST_RECIPIENT=tu-correo-corporativo
ALERT_EMAIL_ALLOWLIST=tu-correo-corporativo
```

Requisitos y recomendaciones:

- Se requiere una **cuenta o buzón autorizado por IT** como remitente.
- **SMTP AUTH** debe estar habilitado para la cuenta emisora en Microsoft 365.
- En **producción**, validar con IT la estrategia adecuada: SMTP AUTH, Microsoft Graph API, Power Automate o Workato.
- **Nunca** subir `.env`, contraseñas ni secretos al repositorio.

Documentación detallada: [`gestor-recursos-backend/README.md`](gestor-recursos-backend/README.md#alertas--notificaciones-por-correo-microsoft-365).

## Bonus Workato GO-ready

El sistema expone un endpoint de resumen ejecutivo pensado para integraciones con Workato Genie:

```
GET /api/ai/executive-summary
```

- Requiere el header `x-demo-user` (igual que el resto de la API demo).
- **MANAGER**: genera un resumen de su cartera (`managerId`).
- **FINANCE / ADMIN**: genera una vista financiera consolidada.
- La respuesta incluye `summary`, `risks`, `recommendations`, `metrics`, `workatoReady` y `generatedAt`.
- El texto se genera de forma **determinística** con reglas sobre datos reales del sistema (vencimientos, OCs pendientes, presupuesto).
- **No se integró IA externa en local** para mantener seguridad y simplicidad del entorno de desarrollo.
- En **producción**, Workato GO podría consumir este endpoint mediante una skill o recipe HTTP y enriquecer la respuesta con AI by Workato, Azure OpenAI u otro modelo autorizado por la organización.

Ejemplo de consumo:

```bash
curl -H "x-demo-user: manager-colombia" http://localhost:3000/api/ai/executive-summary
curl -H "x-demo-user: finance" http://localhost:3000/api/ai/executive-summary
```

En el Dashboard, la card **Resumen ejecutivo** muestra la misma información con botón **Actualizar resumen**.

## Build

```bash
cd gestor-recursos-backend && npm run build
cd gestor-recursos-frontend && npm run build
```
