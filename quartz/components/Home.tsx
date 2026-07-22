import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import Graph from "./Graph"
import Darkmode from "./Darkmode"
// @ts-ignore
import style from "./styles/home.scss"

const HeroGraph = Graph({
  localGraph: {
    drag: true,
    zoom: true,
    depth: -1,
    scale: 0.85,
    repelForce: 0.6,
    centerForce: 0.25,
    linkDistance: 60,
    fontSize: 0.65,
    opacityScale: 1,
    showTags: false,
    removeTags: [],
    focusOnHover: true,
    enableRadial: true,
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
Home.afterDOMLoaded = HeroGraph.afterDOMLoaded
Home.beforeDOMLoaded = DarkmodeToggle.beforeDOMLoaded

export default (() => Home) satisfies QuartzComponentConstructor
