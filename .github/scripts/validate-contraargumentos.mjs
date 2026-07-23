// Valida que cada nota de contraargumento sigue la plantilla del sitio.
// Se ejecuta en CI (ver .github/workflows/validar-contraargumentos.yml) sobre
// cada Pull Request, y también puede lanzarse en local:
//
//   node .github/scripts/validate-contraargumentos.mjs
//
// El vocabulario válido de `falacia` y `argumento` se lee de
// content/meta/falacias.md, que es la única fuente de verdad.

import fs from "node:fs"
import path from "node:path"
import yaml from "js-yaml"

const ROOT = process.cwd()
const CONTRA_DIR = path.join(ROOT, "content", "contraargumentos")
const FALACIAS_FILE = path.join(ROOT, "content", "meta", "falacias.md")

const ESTADOS = ["borrador", "revision", "verificado"]
const REQUIRED_STRINGS = ["title", "objecion", "respuesta_corta"]

// --- Vocabulario controlado, extraído de content/meta/falacias.md ---
function readVocabulary() {
  const text = fs.readFileSync(FALACIAS_FILE, "utf8")
  const falacia = new Set()
  const argumento = new Set()
  let current = null
  for (const line of text.split(/\r?\n/)) {
    if (/^##\s+Falacias/i.test(line)) {
      current = falacia
      continue
    }
    if (/^##\s+Tipos de argumento/i.test(line)) {
      current = argumento
      continue
    }
    if (/^##\s/.test(line)) {
      current = null
      continue
    }
    const m = line.match(/^-\s+\*\*`([a-z0-9-]+)`\*\*/)
    if (m && current) current.add(m[1])
  }
  return { falacia, argumento }
}

function extractFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) throw new Error("no tiene bloque de frontmatter (--- ... ---)")
  const data = yaml.load(m[1])
  if (data === null || typeof data !== "object") {
    throw new Error("el frontmatter no es un objeto YAML válido")
  }
  return data
}

function validateFile(rel, fm, vocab, errors, warnings) {
  const err = (msg) => errors.push(`${rel}: ${msg}`)
  const warn = (msg) => warnings.push(`${rel}: ${msg}`)

  for (const field of REQUIRED_STRINGS) {
    if (typeof fm[field] !== "string" || fm[field].trim() === "") {
      err(`falta el campo "${field}" (debe ser texto no vacío)`)
    }
  }

  if (fm.tipo !== "contraargumento") {
    err(`"tipo" debe ser "contraargumento" (es ${JSON.stringify(fm.tipo)})`)
  }

  if (!ESTADOS.includes(fm.estado)) {
    err(`"estado" debe ser uno de [${ESTADOS.join(", ")}] (es ${JSON.stringify(fm.estado)})`)
  }

  if (!Array.isArray(fm.tags) || !fm.tags.includes("tipo/contraargumento")) {
    err(`"tags" debe ser una lista que incluya "tipo/contraargumento"`)
  }

  const checkVocab = (field, allowed) => {
    const value = fm[field]
    if (!Array.isArray(value) || value.length === 0) {
      err(`"${field}" debe ser una lista no vacía`)
      return
    }
    for (const item of value) {
      if (!allowed.has(item)) {
        err(
          `"${field}": "${item}" no está en el vocabulario. ` +
            `Valores válidos: [${[...allowed].join(", ")}]. ` +
            `Si es nuevo, defínelo primero en content/meta/falacias.md.`,
        )
      }
    }
  }
  checkVocab("falacia", vocab.falacia)
  checkVocab("argumento", vocab.argumento)

  // Avisos (no bloquean, solo recomiendan)
  if (!Array.isArray(fm.aliases) || fm.aliases.length === 0) {
    warn(`sin "aliases" — añadir variantes de la objeción mejora el buscador`)
  }
  if (fm.estado === "verificado" && Array.isArray(fm.fuentes) && fm.fuentes.length === 0) {
    warn(`estado "verificado" pero "fuentes" está vacío`)
  }
}

function main() {
  const vocab = readVocabulary()
  if (vocab.falacia.size === 0 || vocab.argumento.size === 0) {
    console.error("✗ No se pudo leer el vocabulario de content/meta/falacias.md")
    process.exit(1)
  }

  const files = fs
    .readdirSync(CONTRA_DIR)
    .filter((f) => f.endsWith(".md") && f !== "index.md")
    .sort()

  const errors = []
  const warnings = []

  for (const file of files) {
    const rel = `content/contraargumentos/${file}`
    const full = path.join(CONTRA_DIR, file)
    try {
      const fm = extractFrontmatter(fs.readFileSync(full, "utf8"))
      validateFile(rel, fm, vocab, errors, warnings)
    } catch (e) {
      errors.push(`${rel}: ${e.message}`)
    }
  }

  if (warnings.length > 0) {
    console.log("Avisos:")
    for (const w of warnings) console.log(`  ⚠ ${w}`)
    console.log("")
  }

  if (errors.length > 0) {
    console.error(`✗ ${errors.length} error(es) de formato en los contraargumentos:\n`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    console.error(
      "\nRevisa la plantilla en CONTRIBUTING.md y el vocabulario en content/meta/falacias.md.",
    )
    process.exit(1)
  }

  console.log(`✓ ${files.length} contraargumentos validados correctamente.`)
}

main()
