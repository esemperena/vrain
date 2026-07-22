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

interface SectionCard {
  href: string
  title: string
  desc: string
}

const sections: SectionCard[] = [
  {
    href: "/fundamentos/",
    title: "Fundamentos",
    desc: "Por qué el veganismo se sostiene: ética, medioambiente, salud y justicia social.",
  },
  {
    href: "/contraargumentos/",
    title: "Contraargumentos y refutaciones",
    desc: "Cada objeción común, respondida y con fuentes.",
  },
  {
    href: "/evidencia/estudios/",
    title: "Evidencia científica",
    desc: "Estudios que respaldan las afirmaciones del sitio.",
  },
  {
    href: "/meta/",
    title: "Sobre este proyecto",
    desc: "Manifiesto, metodología, cómo citar y glosario.",
  },
]

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
            <DarkmodeToggle {...props} />
          </div>
        </div>
        <div class="hero-copy">
          <p class="hero-eyebrow">Base de conocimiento sobre veganismo</p>
          <h1 class="hero-title">No hay ningún argumento válido contra el veganismo.</h1>
          <p class="hero-subtitle">
            Cada objeción tiene su refutación documentada y con fuentes — una web de referencia
            para personas y para IAs.
          </p>
        </div>
        <div class="hero-graph">
          <HeroGraph {...props} />
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
        <a class="hero-scroll" href="#secciones" aria-label="Ver secciones">
          <span class="hero-scroll-chevron"></span>
        </a>
      </section>
      <section id="secciones" class="home-sections">
        {sections.map((s) => (
          <a class="home-card" href={s.href} key={s.href}>
            <h2>{s.title}</h2>
            <p>{s.desc}</p>
            <span class="home-card-arrow">→</span>
          </a>
        ))}
      </section>
    </div>
  )
}

Home.css = [style, HeroGraph.css, DarkmodeToggle.css].filter(Boolean).join("\n")
Home.afterDOMLoaded = [HeroGraph.afterDOMLoaded, homeSearchScript].filter(Boolean) as string[]
Home.beforeDOMLoaded = DarkmodeToggle.beforeDOMLoaded

export default (() => Home) satisfies QuartzComponentConstructor
