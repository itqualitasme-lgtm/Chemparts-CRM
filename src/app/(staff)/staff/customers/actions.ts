'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePortal, requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { createAdminClient } from '@/lib/supabase/admin'
import { customerSchema, parseContacts } from '@/lib/validation/customer'

export type CustomerState = { error?: string; fieldErrors?: Record<string, string[]>; ok?: boolean }
export type DocState = { error?: string; ok?: boolean }

const BUCKET = 'product-images'
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']

function contactCreateData(contacts: ReturnType<typeof parseContacts>) {
  // Ensure at most one primary; if none marked, the first becomes primary.
  let primarySeen = false
  return contacts.map((c, i) => {
    let isPrimary = c.isPrimary && !primarySeen
    if (isPrimary) primarySeen = true
    if (!primarySeen && i === contacts.length - 1) isPrimary = true // fallback: last if none
    return {
      name: c.name,
      designation: c.designation ?? null,
      email: c.email ?? null,
      phone: c.phone ?? null,
      isPrimary,
    }
  })
}

export async function createCustomer(_prev: CustomerState, formData: FormData): Promise<CustomerState> {
  const user = await requirePortal('staff')
  const parsed = customerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const d = parsed.data
  const contacts = parseContacts(formData.get('contactsJson') as string | null)

  const customer = await db.customer.create({
    data: {
      companyName: d.companyName,
      country: d.country,
      city: d.city ?? null,
      address: d.address ?? null,
      trn: d.trn ?? null,
      tradeLicense: d.tradeLicense ?? null,
      industry: d.industry ?? null,
      paymentTerms: d.paymentTerms ?? null,
      creditLimit: d.creditLimit ?? null,
      currency: d.currency,
      phone: d.phone ?? null,
      email: d.email ?? null,
      website: d.website ?? null,
      notes: d.notes ?? null,
      salesPersonId: d.salesPersonId ?? null,
      source: 'STAFF',
      contacts: { create: contactCreateData(contacts) },
    },
    select: { id: true },
  })
  await db.auditLog.create({
    data: { actorId: user.id, action: 'CREATE', entity: 'Customer', entityId: customer.id, detail: { companyName: d.companyName } },
  })

  revalidatePath('/staff/customers')
  redirect(`/staff/customers/${customer.id}`)
}

export async function updateCustomer(
  customerId: string,
  _prev: CustomerState,
  formData: FormData,
): Promise<CustomerState> {
  const user = await requirePortal('staff')
  const parsed = customerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const d = parsed.data
  const contacts = parseContacts(formData.get('contactsJson') as string | null)

  const existing = await db.customer.findUnique({ where: { id: customerId }, select: { id: true } })
  if (!existing) return { error: 'Customer not found.' }

  // Replace contacts wholesale (simple + reliable for a small set).
  await db.$transaction([
    db.contactPerson.deleteMany({ where: { customerId } }),
    db.customer.update({
      where: { id: customerId },
      data: {
        companyName: d.companyName,
        country: d.country,
        city: d.city ?? null,
        address: d.address ?? null,
        trn: d.trn ?? null,
        tradeLicense: d.tradeLicense ?? null,
        industry: d.industry ?? null,
        paymentTerms: d.paymentTerms ?? null,
        creditLimit: d.creditLimit ?? null,
        currency: d.currency,
        phone: d.phone ?? null,
        email: d.email ?? null,
        website: d.website ?? null,
        notes: d.notes ?? null,
        salesPersonId: d.salesPersonId ?? null,
        contacts: { create: contactCreateData(contacts) },
      },
    }),
  ])
  await db.auditLog.create({
    data: { actorId: user.id, action: 'UPDATE', entity: 'Customer', entityId: customerId, detail: { companyName: d.companyName } },
  })

  revalidatePath('/staff/customers')
  revalidatePath(`/staff/customers/${customerId}`)
  return { ok: true }
}

export async function uploadCustomerDocument(
  customerId: string,
  _prev: DocState,
  formData: FormData,
): Promise<DocState> {
  await requirePortal('staff')
  const file = formData.get('file')
  const label = ((formData.get('label') as string | null) ?? '').trim() || 'Document'
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose a file.' }
  if (file.size > MAX_BYTES) return { error: 'File must be 10MB or smaller.' }
  if (!ALLOWED.includes(file.type)) return { error: 'Use PDF, PNG, JPEG or WEBP.' }

  const customer = await db.customer.findUnique({ where: { id: customerId }, select: { id: true } })
  if (!customer) return { error: 'Customer not found.' }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
  const path = `customers/${customerId}/${Date.now()}.${ext}`

  const supabase = createAdminClient()
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (upErr) return { error: `Upload failed: ${upErr.message}` }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  await db.customerDocument.create({ data: { customerId, label, url: data.publicUrl } })

  revalidatePath(`/staff/customers/${customerId}`)
  return { ok: true }
}

/** Admin-only: delete a customer. Blocked if it has enquiries, price requests
 *  or a linked user account (protect history); contacts + documents cascade. */
export async function deleteCustomer(customerId: string): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Only administrators can delete customers.' }

  const c = await db.customer.findUnique({
    where: { id: customerId },
    select: {
      documents: { select: { url: true } },
      _count: { select: { enquiries: true, priceRequests: true, profiles: true } },
    },
  })
  if (!c) return { error: 'Customer not found.' }
  if (c._count.enquiries > 0 || c._count.priceRequests > 0) {
    return { error: 'This customer has enquiries or price requests — reassign or delete those first.' }
  }
  if (c._count.profiles > 0) {
    return { error: 'This customer has a linked user account. Remove that account first.' }
  }

  // Best-effort remove uploaded documents from storage before cascade delete.
  const paths = c.documents
    .map((d) => {
      const i = d.url.indexOf(`/${BUCKET}/`)
      return i === -1 ? null : d.url.slice(i + BUCKET.length + 2)
    })
    .filter((p): p is string => !!p)
  if (paths.length) {
    try {
      await createAdminClient().storage.from(BUCKET).remove(paths)
    } catch {
      // ignore
    }
  }

  await db.customer.delete({ where: { id: customerId } })
  await db.auditLog.create({
    data: { actorId: admin.id, action: 'DELETE', entity: 'Customer', entityId: customerId },
  })
  revalidatePath('/staff/customers')
  redirect('/staff/customers')
}

export async function removeCustomerDocument(docId: string): Promise<void> {
  await requirePortal('staff')
  const doc = await db.customerDocument.findUnique({ where: { id: docId }, select: { url: true, customerId: true } })
  if (!doc) return
  await db.customerDocument.delete({ where: { id: docId } })

  const marker = `/${BUCKET}/`
  const idx = doc.url.indexOf(marker)
  if (idx !== -1) {
    try {
      await createAdminClient().storage.from(BUCKET).remove([doc.url.slice(idx + marker.length)])
    } catch {
      // ignore cleanup failures
    }
  }
  revalidatePath(`/staff/customers/${doc.customerId}`)
}
