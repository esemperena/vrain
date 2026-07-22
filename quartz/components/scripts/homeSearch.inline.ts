import FlexSearch from "flexsearch"

type ContraEntry = {
  slug: string
  title: string
  objecion: string
  respuesta: string
  aliases: string[]
  falacia: string[]
}

// Normaliza para español: minúsculas + sin acentos, para que
// "proteina" encuentre "proteína" y viceversa.
const normalize = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()

// Stopwords españolas: palabras sin valor discriminativo que solo
// añaden ruido al emparejar (y que rompían consultas como "es muy caro").
const STOPWORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "a", "al",
  "y", "o", "u", "e", "que", "en", "con", "por", "para", "se", "su", "sus", "lo",
  "le", "les", "me", "te", "nos", "mi", "tu", "es", "son", "ser", "muy", "mas",
  "este", "esta", "esto", "ese", "esa", "eso", "como", "pero", "si", "no", "ni",
  "ya", "hay", "he", "ha", "han", "the", "of",
])

const encoder = (str: string): string[] =>
  normalize(str)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))

const escapeHTML = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

async function setupHomeSearch() {
  const root = document.querySelector(".home-search") as HTMLElement | null
  if (!root) return

  const input = root.querySelector(".home-search-input") as HTMLInputElement | null
  const results = root.querySelector(".home-search-results") as HTMLElement | null
  if (!input || !results) return

  let entries: ContraEntry[] = []
  try {
    const res = await fetch("static/contraargumentosIndex.json")
    entries = (await res.json()) as ContraEntry[]
  } catch (e) {
    return
  }

  // Dos campos: "objecion" (objeción + alias + título, lo que la gente
  // escribe) pesa más que "respuesta" (texto de la refutación).
  const index = new FlexSearch.Document<{ id: number; objecion: string; respuesta: string }>({
    encode: encoder,
    document: {
      id: "id",
      index: [
        { field: "objecion", tokenize: "forward" },
        { field: "respuesta", tokenize: "forward" },
      ],
    },
  })

  entries.forEach((e, i) => {
    index.add(i, {
      id: i,
      objecion: [e.objecion, e.title, ...e.aliases].join(" \n "),
      respuesta: e.respuesta,
    })
  })

  const render = (ids: number[], term: string) => {
    if (term.trim() === "") {
      results.innerHTML = ""
      root.classList.remove("has-results", "no-results")
      return
    }
    if (ids.length === 0) {
      results.innerHTML = `<div class="home-search-empty">
        <p>No hemos encontrado un contraargumento para eso.</p>
        <p class="home-search-empty-hint">Prueba a reformularlo, o explora el <a href="/contraargumentos/">mapa de contraargumentos</a>.</p>
      </div>`
      root.classList.add("no-results")
      root.classList.remove("has-results")
      return
    }
    root.classList.add("has-results")
    root.classList.remove("no-results")
    results.innerHTML = ids
      .map((i) => {
        const e = entries[i]
        const falacia = e.falacia
          .map((f) => `<span class="home-search-falacia">${escapeHTML(f)}</span>`)
          .join("")
        return `<a class="home-search-card" href="/${e.slug}">
          <p class="home-search-objecion">${escapeHTML(e.objecion)}</p>
          <p class="home-search-respuesta">${escapeHTML(e.respuesta)}</p>
          <div class="home-search-meta">
            ${falacia}
            <span class="home-search-cta">Ver contraargumento →</span>
          </div>
        </a>`
      })
      .join("")
  }

  const search = (term: string) => {
    if (term.trim() === "") {
      render([], term)
      return
    }
    const raw = index.search(term, {
      limit: 6,
      index: ["objecion", "respuesta"],
      suggest: true,
    })
    // Ordena: primero los que casan por objeción/alias, luego por refutación
    const byField = (field: string): number[] => {
      const r = raw.find((x) => x.field === field)
      return r ? (r.result as number[]) : []
    }
    const ordered = [...new Set([...byField("objecion"), ...byField("respuesta")])]
    render(ordered, term)
  }

  input.addEventListener("input", () => search(input.value))
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = results.querySelector(".home-search-card") as HTMLAnchorElement | null
      if (first) first.click()
    }
  })
}

document.addEventListener("nav", () => {
  void setupHomeSearch()
})
