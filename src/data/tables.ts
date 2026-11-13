import { TableConfig } from "../types/index";

export const RETENCION = 12;

export const TABLES: TableConfig[] = [
  {
    id: "BCRA_ACT_SUM",
    name: "BCRA ACT SUM",
    url: "https://www.agendae.com.ar/listado1.aspx?t=42",
    folder: "BCRA",
  },
  {
    id: "BCRA_ACT_CAP",
    name: "BCRA ACT CAP",
    url: "https://www.agendae.com.ar/listado1.aspx?t=43",
    folder: "BCRA",
  },
  {
    id: "BNA_ACT_SUM",
    name: "BNA ACT SUM",
    url: "https://www.agendae.com.ar/listado1.aspx?t=44",
    folder: "BNA",
  },
  {
    id: "BNA_ACT_CAP",
    name: "BNA ACT CAP",
    url: "https://www.agendae.com.ar/listado1.aspx?t=45",
    folder: "BNA",
  },
  {
    id: "NBSF_ACT_SUM",
    name: "NBSF ACT SUM",
    url: "https://www.agendae.com.ar/listado1.aspx?t=46",
    folder: "NBSF",
  },
  {
    id: "NBSF_ACT_CAP",
    name: "NBSF ACT CAP",
    url: "https://www.agendae.com.ar/listado1.aspx?t=47",
    folder: "NBSF",
  },
];

export function getTableConfigById(id: string): TableConfig | undefined {
  return TABLES.find((t) => t.id === id);
}