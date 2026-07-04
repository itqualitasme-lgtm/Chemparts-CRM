import { COUNTRIES, canonicalCountry } from '@/lib/countries'

// Native country dropdown for forms. Preselects the current value (normalising
// legacy abbreviations like USA/UK). If the stored value isn't a known country,
// it's kept as an extra option so nothing is silently lost.
export default function CountrySelect({
  name,
  defaultValue,
  className,
  required,
  placeholder = 'Select country…',
}: {
  name: string
  defaultValue?: string | null
  className?: string
  required?: boolean
  placeholder?: string
}) {
  const current = canonicalCountry(defaultValue)
  const known = COUNTRIES.some((c) => c.name === current)

  return (
    <select name={name} defaultValue={current} required={required} className={className}>
      <option value="">{placeholder}</option>
      {current && !known && <option value={current}>{current}</option>}
      {COUNTRIES.map((c) => (
        <option key={c.code} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>
  )
}
