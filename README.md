# Proyecto-Ashford
Sistema Contable para emprendimientos 

## Ejecutar en computadora

```bash
npm install
npm start
```

Abrir `http://localhost:4173`. En Chrome o Edge se puede instalar como aplicación desde el icono de instalación de la barra de direcciones. La instalación PWA requiere HTTPS cuando se accede desde una URL pública.

## Publicar en Render

El archivo `render.yaml` configura el servicio web, el health check y un disco persistente para `.data`. En Render, crear un Blueprint desde este repositorio y confirmar el servicio `ashford-contable`. Render generará las contraseñas iniciales de `ADMIN_PASSWORD` y `MANAGER_PASSWORD`; consultarlas una sola vez en el panel del servicio y cambiarlas desde **Mi cuenta** después del primer acceso.

Render entrega HTTPS automáticamente. La aplicación web usa el mismo servicio para la interfaz y la API, por lo que `api-config.js` debe permanecer con `window.ASHFORD_API_URL = ""`.

## Preparar Android e iOS

```bash
npm run app:sync
npm run app:android
npm run app:ios
```

Android requiere Android Studio y el SDK correspondiente. iOS requiere macOS y Xcode.

Antes de compilar una app nativa, editar `api-config.js` y definir `window.ASHFORD_API_URL` con la URL HTTPS pública donde esté ejecutándose `server.js`. Una app instalada no puede usar `localhost` para encontrar el servidor.

Los usuarios se almacenan en `.data/users.json`, en el disco persistente de Render. En producción las contraseñas iniciales se generan mediante variables secretas; no se guardan en el repositorio.
