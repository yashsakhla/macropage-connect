// Shared CSV column → contact field mapping helpers. Mappings are kept in the
// UI shape { "CSV header": "field" } and every field may be used by one column only.

export const CSV_CONTACT_FIELDS = ['phone', 'name', 'email', 'company', 'city', 'state', 'country', 'jobTitle', 'tags'] as const
export type CsvContactField = (typeof CSV_CONTACT_FIELDS)[number]

// Exact / near-exact header names only (compared after lowercasing and dropping
// non-alphanumerics). A bare "number" substring is deliberately NOT a match, so
// columns like "VEHICLE NUMBER" are never mistaken for the phone column.
const HEADER_ALIASES: Record<CsvContactField, string[]> = {
  phone: ['phone', 'mobile', 'phonenumber', 'mobilenumber', 'phoneno', 'mobileno', 'whatsapp', 'whatsappnumber', 'whatsappno'],
  name: ['name', 'fullname', 'contactname', 'customername'],
  email: ['email', 'emailaddress', 'emailid'],
  company: ['company', 'companyname', 'organization', 'organisation'],
  city: ['city', 'town'],
  state: ['state', 'province'],
  country: ['country'],
  jobTitle: ['jobtitle', 'title', 'designation'],
  tags: ['tags', 'tag', 'labels'],
}

const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '')

export function autoMapHeaders(headers: string[], allowed: readonly string[] = CSV_CONTACT_FIELDS): Record<string, string> {
  const result: Record<string, string> = {}
  const taken = new Set<string>()
  headers.forEach(h => {
    const norm = normalizeHeader(h)
    const field = (Object.keys(HEADER_ALIASES) as CsvContactField[]).find(
      f => allowed.includes(f) && !taken.has(f) && HEADER_ALIASES[f].includes(norm),
    )
    if (field) {
      result[h] = field
      taken.add(field)
    }
  })
  return result
}

/** Assign `field` to `header`, un-mapping whichever other column previously held it. */
export function setHeaderField(mapping: Record<string, string>, header: string, field: string): Record<string, string> {
  const next: Record<string, string> = {}
  for (const [h, f] of Object.entries(mapping)) {
    if (field && h !== header && f === field) continue
    next[h] = f
  }
  next[header] = field
  return next
}

/** UI shape { header: field } → API shape { field: header }, skipping ignored columns. */
export function invertMapping(mapping: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [header, field] of Object.entries(mapping)) {
    if (field) out[field] = header
  }
  return out
}
