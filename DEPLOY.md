# Deploy en Railway — gradeai-frontend

## Variables de entorno a configurar en Railway

| Variable       | Valor                                                        |
|----------------|--------------------------------------------------------------|
| `VITE_API_URL` | URL del backend en Railway, sin slash final                  |
|                | Ejemplo: `https://gradeai-backend.up.railway.app`           |

> **Importante**: Vite embebe las variables `VITE_*` en el bundle durante el build.
> Si cambias `VITE_API_URL` en Railway, debes forzar un redeploy para que tenga efecto.

## Pasos de deploy

1. Conectar repo en Railway → "New Service" → "GitHub Repo"
2. Seleccionar este repositorio y rama `main`
3. Configurar variable `VITE_API_URL` apuntando al backend
4. Railway detecta `nixpacks.toml` y ejecuta `npm ci && npm run build` automáticamente
5. El sitio queda disponible en `https://<nombre>.up.railway.app`

## Notas

- Railway sirve la app con `npx serve dist` — no requiere servidor Node en producción
- Auto-deploy activado en cada push a `main`
- El build falla si `VITE_API_URL` no está definida (las requests irán a `undefined`)
