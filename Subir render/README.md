# VAN—BREAST · frontend estático

Esta carpeta es una copia independiente del prototipo para publicarlo como **Static Site** en Render. No necesita Python, MongoDB, MQTT, Socket.IO ni variables de entorno: todo funciona con datos simulados en el navegador.

## Publicar en Render

1. Crea un servicio **Static Site** conectado al repositorio.
2. Usa `Subir render` como **Root Directory** (si Render permite elegirla).
3. Deja el **Build Command** vacío.
4. Usa `.` como **Publish Directory**.

También puedes usar el `render.yaml` incluido como guía de configuración.

## Incluye

- `index.html`, `app.css` y `app.js`: interfaz, navegación y datos simulados.
- `vendor/chart.umd.min.js`: gráfica local, sin CDN.
- `assets/`: logo, mapa anatómico, ilustración y lazo.
- `photos/`: fotos de perfil locales usadas por las tarjetas.
- Gráfica de presión con onda senoidal animada, medidores y cambio de estado dentro/fuera de rango.
- Carga y eliminación de foto guardada en `localStorage` para demostrar el flujo sin backend.

Las credenciales son demostrativas: selecciona una cuenta en la pantalla de acceso y pulsa **Entrar**.
