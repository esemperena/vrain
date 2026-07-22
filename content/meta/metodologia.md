---
title: "Metodología"
tags: [tipo/meta]
tipo: meta
estado: verificado
created: 2026-07-22
updated: 2026-07-22
order: 1
---

# Metodología

Cómo se construye y verifica el contenido de este sitio.

## Estados de una nota

Cada nota declara su `estado` en el frontmatter:

- `borrador` — idea capturada, sin revisar.
- `revision` — redactada, pendiente de contrastar fuentes.
- `verificado` — afirmaciones respaldadas por fuentes citadas.

## Publicación (draft)

Quartz decide qué se publica con el campo `draft`, **no** con `estado`. Regla del sitio:

- `estado: verificado` → `draft: false` (se publica).
- `estado: borrador` o `revision` → `draft: true` (no se publica hasta verificar).

Al pasar una nota a `verificado`, poner `draft: false`.

## Reglas para las afirmaciones

1. Toda afirmación factual relevante debe enlazar a una **fuente** (nota en [[evidencia/estudios/index|estudios]] o enlace externo).
2. Las cifras incluyen año y origen.
3. Los contraargumentos incluyen `objecion` y `respuesta_corta` en el frontmatter para lectura por IA.

## Frontmatter estándar

```yaml
---
title: "«Objeción en formato legible»"
aliases: ["forma alternativa de la objeción", "otra variante"]  # ayuda a búsqueda e IA
tags: [tipo/contraargumento, tema/salud]
tipo: contraargumento        # fundamento | contraargumento | evidencia | meta
estado: verificado           # borrador | revision | verificado
draft: false                 # true salvo que estado sea verificado
falacia: [naturalista, tu-quoque]     # listas del vocabulario de [[meta/falacias]]
argumento: [cientifico, reductio-ad-absurdum]
objecion: "La objeción en una frase"
respuesta_corta: "La refutación en 1-2 frases"
description: "Resumen para SEO / IA (suele coincidir con respuesta_corta)"
fuentes: ["[[nombre-estudio]]"]
relacionadas: ["[[otra-nota]]"]
created: 2026-07-22
updated: 2026-07-22
order: 10
---
```

Los valores de `falacia` y `argumento` provienen del vocabulario controlado de [[meta/falacias]]; no inventar etiquetas sin definirlas allí.

## Taxonomía de tags

- `tipo/` — `fundamento`, `contraargumento`, `evidencia`, `meta`
- `tema/` — `etica`, `salud`, `medioambiente`, `social`, `nutricion`
- `estado/` — opcional, refleja el campo `estado`
