// Shared catalog taxonomy — the canonical industry + test-type ids/labels used
// by BOTH the staff product form (checkbox pickers) and the public catalog
// filters. Keeping one source means a product tagged here always matches the
// website's Industry / Test-type filters (no free-text typos).

export type TaxonomyItem = { id: string; label: string }

export const INDUSTRIES: TaxonomyItem[] = [
  { id: 'petroleum', label: 'Petroleum' },
  { id: 'refineries', label: 'Refineries' },
  { id: 'plastics', label: 'Plastics' },
  { id: 'environmental', label: 'Environmental' },
  { id: 'food', label: 'Food & Water' },
  { id: 'materials', label: 'Materials' },
]

export const TEST_TYPES: TaxonomyItem[] = [
  { id: 'analytical', label: 'General Analytical' },
  { id: 'aniline-point', label: 'Aniline Point' },
  { id: 'antioxidant', label: 'Antioxidant' },
  { id: 'carbon-residue', label: 'Carbon Residue' },
  { id: 'chlorine', label: 'Chlorine' },
  { id: 'cloud-point', label: 'Cloud Point' },
  { id: 'coating', label: 'Coating Thickness' },
  { id: 'conductivity', label: 'Conductivity' },
  { id: 'corrosion', label: 'Corrosion' },
  { id: 'distillation', label: 'Distillation' },
  { id: 'elemental', label: 'Elemental' },
  { id: 'evaporation', label: 'Evaporation' },
  { id: 'fire-point', label: 'Fire Point' },
  { id: 'flash-point', label: 'Flash Point' },
  { id: 'foaming', label: 'Foaming' },
  { id: 'freezing-point', label: 'Freezing Point' },
  { id: 'ftir', label: 'FTIR' },
  { id: 'gas-chromatography', label: 'Gas Chromatography' },
  { id: 'halogen', label: 'Halogen' },
  { id: 'mercury', label: 'Mercury' },
  { id: 'moisture', label: 'Moisture' },
  { id: 'multi', label: 'Multi-Parameter' },
  { id: 'nitrogen', label: 'Nitrogen' },
  { id: 'nmr', label: 'NMR' },
  { id: 'oil-condition', label: 'Oil Condition' },
  { id: 'oxidation', label: 'Oxidation' },
  { id: 'ph', label: 'pH' },
  { id: 'pour-point', label: 'Pour Point' },
  { id: 'spectroscopy', label: 'Spectroscopy' },
  { id: 'sulphur', label: 'Sulphur' },
  { id: 'uv-vis', label: 'UV-Vis' },
  { id: 'vapor-pressure', label: 'Vapor Pressure' },
  { id: 'varnish', label: 'Varnish' },
  { id: 'viscosity', label: 'Viscosity' },
  { id: 'wear', label: 'Wear' },
  { id: 'weighing', label: 'Weighing' },
  { id: 'xrf', label: 'XRF' },
]

export const INDUSTRY_IDS = new Set(INDUSTRIES.map((i) => i.id))
export const TEST_TYPE_IDS = new Set(TEST_TYPES.map((t) => t.id))
export const TEST_TYPE_LABELS: Record<string, string> = Object.fromEntries(TEST_TYPES.map((t) => [t.id, t.label]))
