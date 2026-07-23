---
name: evidencia-cientifica
description: Busca evidencia científica (estudios, revisiones, meta-análisis) en Europe PMC, PubMed/NCBI, CrossRef, Unpaywall y OpenAlex, y la integra en el sistema de fuentes del vault Vrain (notas en content/evidencia/estudios/, tabla índice, y frontmatter `fuentes` de los contraargumentos). Usa este skill siempre que el usuario pida investigar, buscar estudios, respaldar, sourcear, citar, verificar o "poner ciencia" a un contraargumento o afirmación nutricional/de salud — incluso si solo dice cosas como "busca papers sobre esto", "necesito respaldar esta objeción con estudios", "¿hay evidencia de X?", o menciona un contraargumento que está en estado "semilla" con `fuentes: []` vacío. También úsalo para investigación científica general del vault (medioambiente, ética, economía) que necesite papers verificables, no solo temas de nutrición.
---

# Evidencia científica para Vrain

Este skill busca papers reales en fuentes académicas y los convierte en notas de evidencia dentro del vault, siguiendo el sistema que ya existe en `content/evidencia/estudios/`. No inventes nunca una cita: cada afirmación numérica o hallazgo que escribas en una nota debe venir del abstract o texto que realmente leíste.

## Cuándo se usa

- El usuario pide investigar un tema, buscar estudios, o "dar ciencia" a un contraargumento.
- Un archivo en `content/contraargumentos/` tiene `fuentes: []` vacío y una sección `## Fuentes` con "Nota semilla" — es candidato directo para este flujo.
- El usuario pregunta si existe evidencia sobre una afirmación nutricional, de salud, medioambiental o ética relacionada con veganismo.

## Flujo de trabajo

### 1. Entender qué hay que respaldar

Si el usuario señala un contraargumento existente (ej. `omega3-cadena-larga.md`), lee su frontmatter: `objecion`, `respuesta_corta`, y el cuerpo (`## Desarrollo`). Cada bullet de "Desarrollo" suele ser una afirmación que necesita su propio estudio. Si el usuario da un tema libre, identifica las 2-4 afirmaciones concretas y verificables que hay que sostener (no busques "veganismo y salud" en general — busca cosas como "ALA to DHA conversion rate humans").

### 2. Buscar candidatos

Usa `scripts/search_studies.py` (no dependencias, solo Python stdlib). Las queries en inglés dan mejores resultados en estas APIs que en español.

```bash
python scripts/search_studies.py "ALA to DHA conversion rate humans" --max-results 15
```

Opciones: `--source europepmc|pubmed|both` (por defecto `both`), `--max-results N`.

El script ya devuelve los resultados con meta-análisis/revisiones sistemáticas/guías priorizadas primero, y dentro de cada grupo ordenados por nº de citas (`cited_by_count`, cuando Europe PMC lo aporta). Lanza 2-3 queries con variantes de la misma pregunta (términos MeSH, sinónimos) en vez de conformarte con la primera tanda de resultados — la cobertura de una sola query suele ser floja.

### 3. Seleccionar y enriquecer

Criterios de inclusión del vault (ya documentados en `content/evidencia/estudios/index.md`, respétalos):
- Prioridad a meta-análisis, revisiones sistemáticas y posiciones oficiales de sociedades científicas sobre estudios individuales pequeños.
- Incluye deliberadamente alguna fuente crítica con el veganismo cuando exista — un contraargumento que solo cita fuentes favorables es frágil.
- DOI (y PMID si existe) obligatorio para que la cita sea verificable.

Para cada estudio candidato con DOI, enriquécelo antes de escribir nada:

```bash
python scripts/enrich_doi.py "10.3390/nu11112661"
```

Esto te da metadatos limpios de CrossRef (incluye volumen/número/páginas para el campo `referencia`), el enlace de PDF en abierto (Unpaywall) si existe, y citas + **estado de retracción** de OpenAlex. Si `is_retracted` es `true` en cualquiera de las dos fuentes, descarta el estudio — no lo cites.

Si el año de CrossRef no coincide con el que muestran PubMed/Europe PMC (pasa con "publicación anticipada" online antes del número impreso), usa el año que aparece indexado en PubMed/Europe PMC para el campo `anio` — es el que sigue la convención bibliográfica habitual y el que ya usan las notas existentes del vault.

Normalmente 2-4 estudios buenos por afirmación es suficiente. No hace falta enriquecer los que ya descartaste por abstract irrelevante.

### 4. Leer de verdad antes de escribir

Lee el `abstract` que devolvió la búsqueda (y el texto completo vía `oa_url` si lo necesitas para cifras concretas que no están en el abstract). La nota que escribas en el paso 5 debe reflejar lo que el estudio dice, con sus matices y limitaciones — no una versión genérica de "los estudios confirman que el veganismo es sano". Si el abstract no da suficiente detalle para escribir "Hallazgos relevantes" con sustancia, es mejor buscar otro estudio que forzar contenido vacío.

### 5. Escribir la nota de evidencia

Crea un archivo en `content/evidencia/estudios/<apellido-año-tema-corto>.md` (minúsculas, guiones, sin tildes — mira los nombres de archivo existentes en esa carpeta como referencia exacta de convención). Sigue la plantilla y estilo de `content/evidencia/estudios/index.md` y de las notas ya existentes (por ejemplo `mariotti-gardner-2019-proteina-aminoacidos-vegetariana.md`):

```yaml
---
title: "Apellido et al. (año) — Título abreviado"
tags: [tipo/evidencia, tema/salud, tema/nutricion]
tipo: evidencia
estado: verificado
tipo_estudio: revision | meta-analisis | ensayo-clinico | observacional | posicion-oficial
autores: "Apellido1 X, Apellido2 Y"
anio: 2019
publicacion: "Nombre de la revista"
referencia: "Revista. Año;Vol(Num):Páginas"
doi: "10.xxxx/xxxxx"
url: "https://..."
relacionadas: ["[[contraargumentos/nombre-del-contraargumento]]", "[[fundamentos/salud]]"]
created: <fecha de hoy>
updated: <fecha de hoy>
---

## Qué es

## Hallazgos relevantes

## Cómo se usa

## Limitaciones
```

La sección **Limitaciones** no es opcional — según las reglas del propio índice, "sin ella, la nota no está terminada". Sé honesto: tamaño muestral, población estudiada, si es narrativa vs. meta-análisis con estimador combinado, conflictos de interés si son evidentes, etc.

### 6. Actualizar el índice

Añade una fila a la tabla correspondiente en `content/evidencia/estudios/index.md` (crea una subsección `###` nueva si el tema no encaja en las existentes). Sigue el formato exacto de las filas ya presentes: `| [[archivo\|Autor et al. — Título corto]] | Tipo | Año | Usado en |`.

### 7. Conectar con el contraargumento

En el archivo de `content/contraargumentos/`:
- Rellena el frontmatter `fuentes:` con los wikilinks a las notas nuevas, ej. `fuentes: ["[[evidencia/estudios/mariotti-gardner-2019-...]]"]`.
- Sustituye el contenido de `## Fuentes` (normalmente un aviso "Nota semilla") por la lista real de fuentes usadas, con una frase breve de qué aporta cada una.
- Si el contraargumento queda bien respaldado (ya no depende de afirmaciones sin fuente), considera cambiar `estado: semilla` a `estado: verificado` — pero coméntaselo al usuario en vez de darlo por hecho si tienes dudas sobre si la cobertura es suficiente.
- Actualiza `updated:` a la fecha de hoy.

## Notas técnicas

- Los scripts son stdlib-only (sin `pip install`), funcionan con cualquier Python 3.8+.
- Configura opcionalmente `RESEARCH_CONTACT_EMAIL` (variable de entorno) con un email de contacto real — lo usan las peticiones a NCBI y Unpaywall según sus políticas de uso; sin configurarlo se usa un placeholder genérico que funciona pero no es lo ideal para uso intensivo.
- Configura opcionalmente `NCBI_API_KEY` para subir el límite de peticiones a PubMed de 3/seg a 10/seg (solo relevante si vas a lanzar muchas queries seguidas).
- Si `search_studies.py` devuelve `errors` no vacío para una fuente, la otra fuente normalmente basta — no bloquees el flujo por eso, avisa al usuario si ambas fallan.
