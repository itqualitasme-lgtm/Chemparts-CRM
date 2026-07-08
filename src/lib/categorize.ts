import { INDUSTRY_IDS, TEST_TYPE_IDS } from './taxonomy'

// Heuristic auto-categoriser: derives Industry + Test-type taxonomy ids from a
// product's brand / name / category / description. Used to backfill the imported
// catalogue AND (via the product actions) to auto-tag new products when a staff
// member leaves the pickers empty, so the public Industry / Test-type filters
// stay populated. Keyword-driven; falls back to sensible defaults.

type ProductLike = { brand?: string | null; name?: string | null; category?: string | null; desc?: string | null; type?: string | null }

// [test-type id, matcher] — order matters only for readability; all matches apply.
const TEST_TYPE_RULES: [string, RegExp][] = [
  ['flash-point', /flash[\s-]?point|pensky|abel|cleveland|closed cup|open cup|\btag\b|recc|flash and fire/i],
  ['fire-point', /fire[\s-]?point/i],
  ['viscosity', /viscosit|viscomet|saybolt|kinematic|redwood|ductil/i],
  ['pour-point', /pour[\s-]?point/i],
  ['cloud-point', /cloud[\s-]?point/i],
  ['freezing-point', /freezing[\s-]?point|cfpp|cold filter|cold flow|freeze/i],
  ['distillation', /distillation|distilling/i],
  ['corrosion', /corrosion|copper strip|copper corrosion|\brust\b|silver corrosion/i],
  ['foaming', /foaming/i],
  ['oxidation', /oxidation|rpvot|\btost\b|induction period|oxidative/i],
  ['carbon-residue', /carbon residue|conradson|ramsbottom|coking/i],
  ['aniline-point', /aniline/i],
  ['evaporation', /evaporation|\bnoack\b|volatilit/i],
  ['vapor-pressure', /vapou?r pressure|\brvp\b|\basvp\b|reid/i],
  ['mercury', /mercury|\bhg\b analy/i],
  ['sulphur', /sulphur|sulfur/i],
  ['chlorine', /chlorine|chloride/i],
  ['nitrogen', /nitrogen/i],
  ['xrf', /\bxrf\b|x[\s-]?ray fluoresc|edxrf|wdxrf|x[\s-]?met|x[\s-]?supreme|x[\s-]?strata|ea\d{3,4}/i],
  ['ftir', /\bftir\b|fourier transform infrared|infralum/i],
  ['nmr', /\bnmr\b|magnetic resonance|benchtop nmr|x[\s-]?pulse|geospec/i],
  ['gas-chromatography', /chromatograph|\bgc\b|\bpgc\b/i],
  ['spectroscopy', /spectromet|spectrophotom|spectroscop|\blibs\b|\boes\b|optical emission|colorimeter|capillary electrophoresis|luminescen/i],
  ['uv-vis', /uv[\s-]?vis|uv visible|ultraviolet|visible spectro/i],
  ['elemental', /elemental|\bicp\b|atomic absorption|\baas\b|flame photometer|graphite furnace/i],
  ['ph', /\bph\b[\s\/-]|ph meter|ph\/mv|ph value/i],
  ['conductivity', /conductivity/i],
  ['coating', /coating thickness|coating|plating thickness|thickness gauge/i],
  ['weighing', /balance|weighing|\bscale\b/i],
  ['moisture', /moisture|karl fischer|water content|water separab|dissolved oxygen|demulsi|herschel/i],
  ['varnish', /varnish|\bmpc\b|membrane patch/i],
  ['oil-condition', /oil condition|\bruler\b|remaining useful|\bdecon\b|solvancer|used oil|wear metal/i],
  ['wear', /wear metal|particle count|particle siz/i],
  ['multi', /multi[\s-]?param|multiparameter/i],
  ['halogen', /halogen|bromine|fluorine|iodine/i],
]

const INDUSTRY_RULES: [string, RegExp][] = [
  ['petroleum', /petroleum|\boil\b|lubricant|\bfuel\b|diesel|gasoline|crude|bitumen|asphalt|grease|\bwax\b|biodiesel|viscosit|flash[\s-]?point|pour[\s-]?point|cloud[\s-]?point|distillation|aniline|foaming|oxidation stability|\brvp\b|saybolt/i],
  ['refineries', /refiner|crude|process gas|natural gas|\blpg\b|\blng\b|sulphur|sulfur|distillation|catalyst/i],
  ['plastics', /plastic|polymer|phthalate|rohs|thermal analy|\bdsc\b|\btma\b|\bdma\b|\bsta\b|melting point|elastomer|rubber/i],
  ['environmental', /environ|\bwater\b|soil|\bair\b|emission|pollution|mercury|waste|drinking water|turbidity|dissolved oxygen/i],
  ['food', /\bfood\b|beverage|oilseed|\bgrain\b|agricult|\bmilk\b|dairy|edible|feed\b|wholegrain/i],
  ['materials', /material|metal|alloy|coating|\bxrf\b|\boes\b|\blibs\b|ferrous|\bsteel\b|furnace|sinter|foundry|mining|ore\b|geolog/i],
]

// Brand-level industry hints when the text is too generic.
const BRAND_INDUSTRY: Record<string, string[]> = {
  Hitachi: ['materials', 'plastics'],
  Nabertherm: ['materials'],
  Lumex: ['environmental', 'food'],
  'Peak Instruments': ['environmental', 'materials'],
  'PG Instruments': ['materials', 'environmental'],
}

export function categorizeProduct(p: ProductLike): { industries: string[]; testTypes: string[] } {
  const text = [p.name, p.category, p.desc, p.brand].filter(Boolean).join(' ')
  const testTypes = new Set<string>()
  const industries = new Set<string>()

  for (const [id, re] of TEST_TYPE_RULES) if (re.test(text)) testTypes.add(id)
  for (const [id, re] of INDUSTRY_RULES) if (re.test(text)) industries.add(id)

  if (!industries.size && p.brand && BRAND_INDUSTRY[p.brand]) BRAND_INDUSTRY[p.brand].forEach((i) => industries.add(i))
  if (!testTypes.size) testTypes.add('analytical')
  if (!industries.size) industries.add('materials')

  return {
    industries: [...industries].filter((i) => INDUSTRY_IDS.has(i)),
    testTypes: [...testTypes].filter((t) => TEST_TYPE_IDS.has(t)),
  }
}
