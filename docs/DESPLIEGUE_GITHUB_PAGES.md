# Publicar en GitHub Pages

Esta aplicación se publica automáticamente en GitHub Pages desde la rama `main`.

- Repositorio: `https://github.com/EdgarLopez95/estudio-entrevista-penal`
- Sitio público: `https://edgarlopez95.github.io/estudio-entrevista-penal/`
- Automatización: `.github/workflows/deploy-pages.yml`

## Publicación habitual

Desde la carpeta raíz del proyecto, un agente solo necesita comprobar la aplicación, confirmar sus cambios y subirlos a `main`:

```powershell
cd C:\Users\NITRO\Desktop\Estudio
npm ci
npm run build
git status
git add <archivos-cambiados>
git commit -m "Describe el cambio"
git push origin main
```

El `push` inicia el flujo **Desplegar en GitHub Pages**. Este flujo instala las dependencias con `npm ci`, crea `dist` con `npm run build` y publica exactamente esa carpeta.

No se debe subir `dist` manualmente ni modificar el sitio desde la interfaz de GitHub: el resultado publicado debe venir siempre de una compilación reproducible del repositorio.

## Verificar que quedó publicado

Tras el `push`, espera a que el flujo termine correctamente:

```powershell
gh run list --repo EdgarLopez95/estudio-entrevista-penal --workflow "Desplegar en GitHub Pages" --limit 1
```

Si aparece `in_progress`, se puede esperar al resultado con el identificador de la ejecución:

```powershell
gh run watch <ID_DE_LA_EJECUCION> --repo EdgarLopez95/estudio-entrevista-penal --exit-status
```

Cuando ambos trabajos, `build` y `deploy`, estén en verde, abre:

`https://edgarlopez95.github.io/estudio-entrevista-penal/`

En una actualización visual, usa una recarga fuerte del navegador (`Ctrl + F5`) si todavía ves archivos almacenados en caché.

## Publicar sin cambios de código

Para volver a ejecutar la publicación desde GitHub:

1. Abre **Actions** en el repositorio.
2. Selecciona **Desplegar en GitHub Pages**.
3. Pulsa **Run workflow** y elige la rama `main`.
4. Espera a que `build` y `deploy` terminen correctamente.

También se puede hacer desde una terminal autenticada con GitHub CLI:

```powershell
gh workflow run "Desplegar en GitHub Pages" --repo EdgarLopez95/estudio-entrevista-penal --ref main
```

## Configuración inicial o recuperación

Si el repositorio se clona, se migra o Pages deja de servir el sitio, verifica estas condiciones antes de cambiar código:

1. En GitHub, entra a **Settings → Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions** como fuente.
3. Confirma que existe `.github/workflows/deploy-pages.yml` en `main`.
4. Confirma que `vite.config.ts` conserva `base: './'`. Esto permite que los recursos funcionen dentro de la ruta `/estudio-entrevista-penal/` de GitHub Pages.
5. Ejecuta `npm run build` localmente y vuelve a subir el cambio o lanza el flujo manualmente.

El flujo requiere los permisos `contents: read`, `pages: write` e `id-token: write`; ya están declarados en el archivo de automatización. No los elimines.

## Si falla

| Señal | Qué revisar |
| --- | --- |
| Falla `Instalar dependencias` | Confirma que `package-lock.json` fue incluido con el cambio. El flujo usa `npm ci`, que exige que coincida con `package.json`. |
| Falla `Crear versión de producción` | Ejecuta `npm run build` localmente y corrige el error de TypeScript o Vite antes de volver a subir. |
| El sitio abre, pero sin estilos o scripts | Revisa que `vite.config.ts` mantenga `base: './'` y que el flujo publique `dist`. |
| GitHub muestra que Pages no está configurado | En **Settings → Pages**, cambia la fuente a **GitHub Actions**. |
| La página sigue mostrando una versión anterior | Confirma que la última ejecución esté en verde y recarga con `Ctrl + F5`. |

## Checklist para otro agente

- Trabaja en `C:\Users\NITRO\Desktop\Estudio`.
- No reemplaces cambios ajenos ni uses `git reset --hard`.
- Antes de publicar, ejecuta al menos `npm run build`; para cambios de comportamiento, ejecuta además las pruebas pertinentes.
- Sube únicamente los archivos relacionados con la solicitud.
- Espera el resultado en verde de GitHub Actions antes de informar que el enlace está actualizado.
