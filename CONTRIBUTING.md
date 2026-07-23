# Cómo contribuir a Vrain

Gracias por querer aportar. Hay dos formas de hacerlo, según cuánto quieras implicarte.

## 1. Sugerir una objeción (la vía fácil)

Si solo quieres proponer un contraargumento que falta, **no necesitas tocar código**: abre un
issue con el formulario [«Nuevo contraargumento»](https://github.com/esemperena/vrain/issues/new?template=nuevo-contraargumento.yml).
Rellenas la objeción y sus variantes, y el mantenimiento del sitio crea la nota con el formato correcto.

## 2. Escribir un contraargumento (Pull Request)

Si quieres redactar la nota tú mismo:

1. Haz un *fork* del repo y crea una rama.
2. Crea el fichero en `content/contraargumentos/` con un nombre en **`kebab-case` sin acentos**
   (p. ej. `no-es-universal.md`). Ese nombre será la URL.
3. Copia la plantilla de abajo y rellénala.
4. Abre un Pull Request. Una comprobación automática validará el formato (ver más abajo).

### Plantilla de un contraargumento

```yaml
---
title: "«La objeción en formato legible»"
aliases: ["forma alternativa de la objeción", "otra manera de decirlo"]
tags: [tipo/contraargumento, tema/salud]
tipo: contraargumento
estado: revision              # borrador | revision | verificado
draft: false                  # true salvo que estado sea "verificado"
falacia: [naturalista]        # valores de content/meta/falacias.md
argumento: [cientifico]       # valores de content/meta/falacias.md
objecion: "La objeción en una frase."
respuesta_corta: "La refutación en 1-2 frases."
description: "Resumen para SEO/IA (suele coincidir con respuesta_corta)."
fuentes: []
relacionadas: ["[[otra-nota]]"]
created: 2026-01-01
updated: 2026-01-01
order: 20
---

> [!question] Objeción
> La objeción, tal como la formularía alguien real.

## Respuesta corta

La refutación resumida.

## Desarrollo

El razonamiento completo, con fuentes.

## Fuentes

Enlaces o notas de [[evidencia/estudios/index]].
```

### Reglas de formato (las valida el CI)

- Campos obligatorios: `title`, `objecion`, `respuesta_corta`, `tipo: contraargumento`,
  `estado`, `tags` (con `tipo/contraargumento`), y `falacia` / `argumento` como listas no vacías.
- Los valores de **`falacia`** y **`argumento`** deben existir en
  [`content/meta/falacias.md`](content/meta/falacias.md), que es el vocabulario controlado.
  ¿Necesitas uno nuevo? Defínelo primero ahí, en el mismo PR.
- Recomendado: `aliases` con las formas reales en que la gente formula la objeción
  (alimentan el buscador de la home).

Convenciones generales del proyecto: [`content/meta/metodologia.md`](content/meta/metodologia.md).
Personalizaciones sobre el motor Quartz: [`CUSTOMIZATIONS.md`](CUSTOMIZATIONS.md).

### Validar en local antes del PR

```bash
node .github/scripts/validate-contraargumentos.mjs
```

Requiere haber ejecutado `npm install` una vez. Si todo está bien, verás
`✓ N contraargumentos validados correctamente.`

## Revisión

Todo PR lo revisa el mantenimiento antes de fusionar. Más allá del formato (que valida el CI),
se comprueba que el argumento sea sólido y esté bien fundamentado: Vrain es una base de
conocimiento **con postura y con fuentes**, no un espacio de debate abierto.
