# Vrain

Base de conocimiento (*second brain*) sobre veganismo en Markdown. Se edita con **Obsidian**, se versiona en **GitHub** y se publica con **Quartz** en **Netlify**.

> **Premisa del proyecto:** no existen argumentos válidos contra el veganismo. Cada objeción común se recoge y se refuta con razonamiento y fuentes.

## Estructura

```
content/                 # raíz de notas (vault de Obsidian y fuente de Quartz)
├── index.md             # portada
├── fundamentos/         # pilares: ética, medioambiente, salud, justicia social
├── contraargumentos/    # núcleo: una nota por objeción (en plano) + mapa
├── evidencia/estudios/  # una nota por estudio, citable desde el resto
└── meta/                # manifiesto, metodología, cómo citar, glosario
llms.txt                 # índice legible para modelos de IA
netlify.toml             # build de Netlify
```

## Convenciones

- **Nombres de fichero** en `kebab-case` sin acentos → URLs limpias. El título bonito va en `title:` del frontmatter.
- **Sin prefijos numéricos** en carpetas; el orden se controla con `order:` en el frontmatter.
- **Notas atómicas** y enlazadas con `[[wikilinks]]`.
- **Frontmatter estándar** y taxonomía de tags: ver [`content/meta/metodologia.md`](content/meta/metodologia.md).
- Los **contraargumentos** incluyen `objecion` y `respuesta_corta` para lectura por IA.

## Puesta en marcha (pendiente)

### Editar

Abrir la carpeta `content/` como vault en Obsidian y editar las notas.

### Previsualizar en local

```bash
npx quartz build --serve
```

Sirve el sitio en `http://localhost:8080` con recarga en caliente. Los borradores (`draft: true`) no se muestran.

### Publicar en Netlify

1. Instalar dependencias una vez: `npm install`.
2. Subir el repo a GitHub.
3. En Netlify, "Add new site → Import from Git" y elegir el repo. El [`netlify.toml`](netlify.toml) ya define el build (`npx quartz build` → `public/`).
4. Tras el primer deploy, actualizar `baseUrl` en [`quartz.config.ts`](quartz.config.ts) con el dominio real (afecta a sitemap, RSS y OpenGraph).

> Quartz v4 ya está integrado en el repo. El índice para IAs se publica en `/llms.txt` (fichero en `content/llms.txt`).
