import { FullSlug, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"

// Índice a medida para el buscador de la home: extrae de cada
// contraargumento los campos del frontmatter que sirven para emparejar
// la objeción que escribe el usuario con la refutación que aplica.
type ContraEntry = {
  slug: string
  title: string
  objecion: string
  respuesta: string
  aliases: string[]
  falacia: string[]
}

const toArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String)
  if (v == null || v === "") return []
  return [String(v)]
}

export const ContraargumentosIndex: QuartzEmitterPlugin = () => {
  return {
    name: "ContraargumentosIndex",
    async *emit(ctx, content) {
      const entries: ContraEntry[] = []
      for (const [, file] of content) {
        const fm = file.data.frontmatter as Record<string, unknown> | undefined
        if (!fm || fm.tipo !== "contraargumento") continue
        // el índice de la carpeta no tiene objeción; se salta
        if (!fm.objecion) continue
        entries.push({
          slug: file.data.slug!,
          title: String(fm.title ?? ""),
          objecion: String(fm.objecion ?? ""),
          respuesta: String(fm.respuesta_corta ?? ""),
          aliases: toArray(fm.aliases),
          falacia: toArray(fm.falacia),
        })
      }

      yield write({
        ctx,
        content: JSON.stringify(entries),
        slug: joinSegments("static", "contraargumentosIndex") as FullSlug,
        ext: ".json",
      })
    },
    async *partialEmit() {},
  }
}
