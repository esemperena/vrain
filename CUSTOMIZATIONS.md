# Personalizaciones sobre Quartz

El directorio `quartz/` es una copia del motor [Quartz v4](https://quartz.jzhao.xyz/) con modificaciones propias de Vrain. Este documento las lista todas.

> ⚠️ **Antes de `quartz update`:** ese comando puede sobrescribir archivos del motor. Cualquier archivo marcado como **MODIFICADO** aquí necesita reintegrarse a mano tras una actualización. Los archivos **AÑADIDOS** normalmente sobreviven, pero conviene revisarlos. Haz la actualización en una rama y compara con este documento.

## Resumen

| Archivo | Estado | Propósito |
|---------|--------|-----------|
| `quartz/components/Home.tsx` | **AÑADIDO** | Componente de la landing page |
| `quartz/components/styles/home.scss` | **AÑADIDO** | Estilos de la landing page y del buscador |
| `quartz/components/scripts/homeSearch.inline.ts` | **AÑADIDO** | Lógica cliente del buscador de contraargumentos |
| `quartz/plugins/emitters/contraargumentosIndex.tsx` | **AÑADIDO** | Emisor que genera el índice del buscador |
| `quartz/components/Graph.tsx` | MODIFICADO | Opción `showLabels` en `D3Config` |
| `quartz/components/scripts/graph.inline.ts` | MODIFICADO | Soporte de `showLabels` |
| `quartz/components/index.ts` | MODIFICADO | Exporta `Home` |
| `quartz/plugins/emitters/index.ts` | MODIFICADO | Exporta `ContraargumentosIndex` |
| `quartz/styles/custom.scss` | MODIFICADO | Overrides de la home (colapsar grid, ocultar sidebars) |
| `quartz.config.ts` | MODIFICADO | Identidad, idioma, plugin del índice |
| `quartz.layout.ts` | MODIFICADO | Monta `Home` solo en la portada |
| `netlify.toml` | MODIFICADO | Comando de build sin `npx` |

---

## Landing page personalizada

La portada (`content/index.md`, slug `index`) no usa la plantilla wiki de Quartz, sino un componente propio.

- **`quartz/components/Home.tsx`** (AÑADIDO) — hero con la premisa como titular, el graph global centrado (reutiliza el componente `Graph` de Quartz con config propia y `showLabels: true`), el buscador y un grid de secciones. Incluye una copia del toggle de modo oscuro para la topbar.
- **`quartz/components/styles/home.scss`** (AÑADIDO) — todos los estilos de `.hero*`, `.home-*` y `.home-search*`.
- **`quartz/components/index.ts`** (MODIFICADO) — añade `import Home` y lo incluye en el `export`.
- **`quartz.layout.ts`** (MODIFICADO) — en `defaultContentPageLayout.beforeBody`, `Home` se renderiza vía `ConditionalRender` solo cuando `slug === "index"`; en esa misma página se ocultan `Breadcrumbs`, `ArticleTitle`, `ContentMeta`, `TagList` y el `Graph` de la barra lateral (todos condicionados a `slug !== "index"`). El `footer` apunta al repo del proyecto en vez de a los enlaces por defecto de Quartz.
- **`quartz/styles/custom.scss`** (MODIFICADO) — bajo `body[data-slug="index"]`: colapsa el grid a una columna, oculta las sidebars y el `<article>` de markdown (la home no muestra el cuerpo de `index.md`).

## Graph con etiquetas visibles

- **`quartz/components/Graph.tsx`** (MODIFICADO) — campos opcionales `showLabels?: boolean` y `labelThreshold?: number` en la interfaz `D3Config`.
- **`quartz/components/scripts/graph.inline.ts`** (MODIFICADO) — cuando `showLabels` es `true`, las etiquetas de los nodos nacen con `alpha: 1` y el handler de zoom no las atenúa. Cambio **aditivo**: si `showLabels` no se define (los grafos de las demás páginas), el comportamiento es el original.
- **`labelThreshold`** — con `showLabels: true`, limita la etiqueta fija a las páginas principales: los índices de sección (`*/index.md`, siempre) más los nodos con al menos N enlaces. Los demás recuperan el comportamiento por defecto (aparecen al acercar el zoom o al pasar el ratón). Evita que un grafo con `depth: -1` dibuje decenas de textos solapados. Sin `labelThreshold` se etiquetan todos los nodos, como antes.
  - Implementación: se extrae `numLinksFor(id)` (que ya usaba `nodeRadius`), se construye `indexSlugs` a partir de las claves de `contentIndex.json`, se calcula `alwaysShowLabel` por nodo al crearlo y se guarda en `NodeRenderData`; el handler de zoom recorre `nodeRenderData` en vez de `labelsContainer.children` para respetar ese flag.
  - La home lo usa con `labelThreshold: 15` → etiqueta fija en los 5 índices de sección más «¿Y la proteína?» (17 enlaces), 6 de 54 nodos.
  - **Por qué el umbral es alto:** los títulos de las notas de estudio miden 80-90 caracteres (`Melina et al. (2016) — Posición de la Academy…`). Un umbral bajo (6) las incluía y saturaba el grafo más que el problema original. Los índices de sección, en cambio, tienen títulos de 5-31 caracteres, y por eso se etiquetan siempre al margen del umbral.

### Configuración del graph en las páginas de contenido

- **`quartz.layout.ts`** (MODIFICADO) — el `Graph` de la barra lateral recibe `showTags: false` para igualar la configuración de Obsidian. Por defecto Quartz usa `showTags: true`, lo que convertía cada uno de los 16 tags del vault en un nodo *hub* conectado a decenas de notas y saturaba el grafo.

## Buscador de contraargumentos (Nivel 2)

Buscador estático estilo Google en la home. El usuario escribe un argumento contra el veganismo y ve el contraargumento que aplica.

- **`quartz/plugins/emitters/contraargumentosIndex.tsx`** (AÑADIDO) — emisor que, en cada build, recorre las notas con `tipo: contraargumento` y emite `public/static/contraargumentosIndex.json` con `{slug, title, objecion, respuesta, aliases, falacia}` tomados del frontmatter.
- **`quartz/plugins/emitters/index.ts`** (MODIFICADO) — exporta `ContraargumentosIndex`.
- **`quartz.config.ts`** (MODIFICADO) — registra `Plugin.ContraargumentosIndex()` en `emitters`.
- **`quartz/components/scripts/homeSearch.inline.ts`** (AÑADIDO) — carga ese JSON, construye un índice FlexSearch (campos `objecion` y `respuesta`, con `objecion` = objeción + alias + título) y renderiza las tarjetas de resultado. Incluye normalización de acentos, stopwords españolas y `suggest` para coincidencias parciales.

**Dependencia del contenido:** el buscador solo es tan bueno como los campos `objecion`, `aliases` y `respuesta_corta` del frontmatter de cada contraargumento. Añadir `aliases` con las formas en que la gente formula una objeción mejora directamente la recuperación.

**Limitación conocida:** es búsqueda por palabras clave, no semántica. Una paráfrasis sin raíz de palabra compartida no encuentra match (se maneja con un estado vacío). Un "Nivel 3" semántico (embeddings o IA vía Netlify Functions) se podría montar como *fallback* encima, sin rehacer lo existente.

## Configuración general

- **`quartz.config.ts`** (MODIFICADO) — `pageTitle: "Vrain"`, `locale: "es-ES"`, `analytics: null`, `baseUrl: "vvrain.netlify.app"`, y el plugin del índice.
- **`netlify.toml`** (MODIFICADO) — build con `node ./quartz/bootstrap-cli.mjs build` en vez de `npx quartz build` (el npm de Netlify no resolvía el `bin` del paquete raíz → exit 127).
