# Vrain

Base de conocimiento (*second brain*) sobre veganismo en Markdown. Se edita con **Obsidian**, se versiona en **GitHub** y se publica con **Quartz** en **Netlify**.

> **Premisa del proyecto:** no existen argumentos válidos contra el veganismo. Cada objeción común se recoge y se refuta con razonamiento y fuentes.

- **Sitio en vivo:** https://vvrain.netlify.app/
- **Índice para IAs:** https://vvrain.netlify.app/llms.txt

## Estructura

```
content/                 # raíz de notas (vault de Obsidian y fuente de Quartz)
├── index.md             # portada (renderizada por la landing page personalizada)
├── fundamentos/         # pilares: ética, medioambiente, salud, justicia social
├── contraargumentos/    # núcleo: una nota por objeción (en plano) + mapa
├── evidencia/estudios/  # una nota por estudio, citable desde el resto
├── meta/                # manifiesto, metodología, cómo citar, glosario, taxonomía de falacias
└── llms.txt             # índice legible para modelos de IA (se sirve en /llms.txt)
netlify.toml             # build de Netlify
quartz/                  # motor Quartz v4 (con personalizaciones, ver CUSTOMIZATIONS.md)
```

## Convenciones

- **Nombres de fichero** en `kebab-case` sin acentos → URLs limpias. El título bonito va en `title:` del frontmatter.
- **Sin prefijos numéricos** en carpetas; el orden se controla con `order:` en el frontmatter.
- **Notas atómicas** y enlazadas con `[[wikilinks]]`.
- **Frontmatter estándar** y taxonomía de tags: ver [`content/meta/metodologia.md`](content/meta/metodologia.md).
- Los **contraargumentos** incluyen `objecion`, `respuesta_corta`, `aliases`, `falacia` y `argumento`. Esos campos alimentan el buscador de la home; la taxonomía de valores de `falacia`/`argumento` está en [`content/meta/falacias.md`](content/meta/falacias.md).
- **Publicación:** Quartz publica según el campo `draft`, no según `estado`. Durante la fase de construcción todas las notas están en `draft: false` para evitar enlaces rotos; ver la excepción documentada en [`content/meta/metodologia.md`](content/meta/metodologia.md).

## Funcionalidades del sitio

- **Landing page personalizada** (no la plantilla wiki de Quartz): la premisa como titular, el graph global centrado como pieza principal, y un grid de secciones bajo el pliegue.
- **Buscador de contraargumentos estilo Google** bajo el graph: el usuario escribe un argumento contra el veganismo y ve el contraargumento que aplica, con su refutación corta y su falacia. 100% estático (FlexSearch en el cliente).
- El resto de páginas usan el layout estándar de Quartz (explorador, buscador global, backlinks, graph local).

> Estas funcionalidades implican cambios sobre el motor de Quartz. **Antes de ejecutar `quartz update`, lee [`CUSTOMIZATIONS.md`](CUSTOMIZATIONS.md)**, que lista cada archivo modificado o añadido y por qué.

## Puesta en marcha

### Editar

Abrir la carpeta `content/` como vault en Obsidian y editar las notas.

### Previsualizar en local

```bash
npm install        # solo la primera vez
npx quartz build --serve
```

Sirve el sitio en `http://localhost:8080` con recarga en caliente. Los borradores (`draft: true`) no se muestran.

### Despliegue en Netlify

Ya configurado: el repo `esemperena/vrain` está conectado a Netlify con deploy continuo. Cada push a `master` dispara un build automático.

El [`netlify.toml`](netlify.toml) define el build como `node ./quartz/bootstrap-cli.mjs build` → `public/`. Se invoca el script directamente en vez de con `npx quartz build` porque el npm de Netlify puede no resolver el `bin` del propio paquete raíz (daba exit 127).

`baseUrl` en [`quartz.config.ts`](quartz.config.ts) apunta a `vvrain.netlify.app` (afecta a sitemap, RSS y OpenGraph). Actualizarlo si cambia el dominio.
