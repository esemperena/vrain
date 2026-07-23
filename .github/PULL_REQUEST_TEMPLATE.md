## Qué añade o cambia este PR

<!-- Describe brevemente el contraargumento o el cambio. -->

## Checklist (para contraargumentos nuevos)

- [ ] El fichero está en `content/contraargumentos/` con nombre en `kebab-case` sin acentos.
- [ ] El frontmatter sigue la plantilla de [CONTRIBUTING.md](../blob/master/CONTRIBUTING.md):
      `title`, `objecion`, `respuesta_corta`, `tipo`, `estado`, `tags`, `falacia`, `argumento`.
- [ ] Los valores de `falacia` y `argumento` existen en `content/meta/falacias.md`
      (o los he añadido ahí en este mismo PR).
- [ ] He añadido `aliases` con variantes reales de la objeción.
- [ ] La refutación está fundamentada (idealmente con fuentes en el cuerpo).
- [ ] `node .github/scripts/validate-contraargumentos.mjs` pasa en local (opcional; el CI también lo comprueba).
