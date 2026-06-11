import type { CategoriaObjectiu, EstatObjectiu } from "@/lib/types";

export type SubObjectiuView = {
  id: string;
  titol: string;
  completat: boolean;
};

export type ObjectiuView = {
  id: string;
  titol: string;
  descripcio: string | null;
  dataInici: string;
  dataFinal: string;
  categoria: CategoriaObjectiu;
  estat: EstatObjectiu;
  progress: number;
  subtasques: SubObjectiuView[];
};

export type ObjectiusStatsView = {
  total: number;
  actius: number;
  completats: number;
  taxaCompletacio: number;
  ratxaMotivacio: number;
};

export function serializeObjectiu(
  objectiu: {
    id: string;
    titol: string;
    descripcio: string | null;
    dataInici: Date;
    dataFinal: Date;
    categoria: string;
    estat: string;
    progress: number;
    subtasques: { id: string; titol: string; completat: boolean }[];
  },
  normalizeCategoria: (v: string) => CategoriaObjectiu,
  normalizeEstat: (v: string) => EstatObjectiu,
): ObjectiuView {
  return {
    id: objectiu.id,
    titol: objectiu.titol,
    descripcio: objectiu.descripcio,
    dataInici: objectiu.dataInici.toISOString(),
    dataFinal: objectiu.dataFinal.toISOString(),
    categoria: normalizeCategoria(objectiu.categoria),
    estat: normalizeEstat(objectiu.estat),
    progress: objectiu.progress,
    subtasques: objectiu.subtasques.map((s) => ({
      id: s.id,
      titol: s.titol,
      completat: s.completat,
    })),
  };
}
