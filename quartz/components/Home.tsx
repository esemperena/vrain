import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import Graph from "./Graph"
import Darkmode from "./Darkmode"
// @ts-ignore
import style from "./styles/home.scss"
// @ts-ignore
import homeSearchScript from "./scripts/homeSearch.inline"

const HeroGraph = Graph({
  localGraph: {
    drag: true,
    zoom: true,
    depth: -1,
    scale: 1,
    repelForce: 1.3,
    centerForce: 0.35,
    linkDistance: 90,
    fontSize: 0.8,
    opacityScale: 1,
    showTags: false,
    removeTags: [],
    focusOnHover: true,
    enableRadial: false,
    showLabels: true,
  },
})

const DarkmodeToggle = Darkmode()

// Abre directamente el issue form "nuevo-contraargumento" (ver .github/ISSUE_TEMPLATE/).
const SUGGEST_ISSUE_URL =
  "https://github.com/esemperena/vrain/issues/new?template=nuevo-contraargumento.yml"

const Home: QuartzComponent = (props: QuartzComponentProps) => {
  return (
    <div class="home">
      <section class="hero">
        <div class="hero-topbar">
          <span class="hero-brand">Vrain</span>
          <div class="hero-topbar-actions">
            <a class="hero-nav-link" href="/contraargumentos/">
              Explorar
            </a>
            <a class="hero-nav-link" href="/colabora">
              Colabora
            </a>
            <DarkmodeToggle {...props} />
          </div>
        </div>
        <div class="hero-copy">
          <p class="hero-eyebrow">Base de conocimiento sobre veganismo</p>
          <h1 class="hero-title">No hay ningún argumento válido contra el veganismo.</h1>
          <p class="hero-subtitle">Inténtalo:</p>
        </div>
        <div class="home-search">
          <div class="home-search-box">
            <svg
              class="home-search-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              class="home-search-input"
              placeholder="Escribe un argumento contra el veganismo…"
              aria-label="Buscar un contraargumento"
              autocomplete="off"
              spellcheck={false}
            />
          </div>
          <div class="home-search-results"></div>
        </div>
        <div class="hero-graph">
          <HeroGraph {...props} />
        </div>
        <a class="hero-scroll" href="#secciones" aria-label="Ver secciones">
          <span class="hero-scroll-chevron"></span>
        </a>
      </section>
      <section id="secciones" class="home-featured-section">
        <h2 class="home-featured-title">Los más buscados</h2>
        <div class="home-featured-grid"></div>
        <a class="home-viewall" href="/contraargumentos/">
          Ver todos →
        </a>
        <div class="home-cta">
          <p class="home-cta-text">¿Crees que nos falta alguna objeción?</p>
          <a class="home-cta-button" href={SUGGEST_ISSUE_URL} target="_blank" rel="noopener noreferrer">
            Sugiérelo en GitHub →
          </a>
        </div>
      </section>
    </div>
  )
}

Home.css = [style, HeroGraph.css, DarkmodeToggle.css].filter(Boolean).join("\n")
Home.afterDOMLoaded = [HeroGraph.afterDOMLoaded, homeSearchScript].filter(Boolean) as string[]
Home.beforeDOMLoaded = DarkmodeToggle.beforeDOMLoaded

export default (() => Home) satisfies QuartzComponentConstructor
