'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { createAdminClient } from '@/lib/supabase/admin'

export type ClientState = { ok?: boolean; error?: string }

const BUCKET = 'product-images'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'client'
}

async function uploadLogo(name: string, file: File): Promise<{ url?: string; error?: string }> {
  if (file.size > MAX_BYTES) return { error: 'Logo must be 5MB or smaller.' }
  if (!ALLOWED.includes(file.type)) return { error: 'Use PNG, JPEG, WEBP or SVG.' }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `clients/${slugify(name)}/${Date.now()}.${ext}`
  const supabase = createAdminClient()
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false, cacheControl: '31536000' })
  if (error) return { error: `Upload failed: ${error.message}` }
  return { url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl }
}

/** Delete a logo from storage if the URL points at our bucket; ignore otherwise. */
async function deleteStoredLogo(logo: string | null): Promise<void> {
  if (!logo) return
  const marker = `/${BUCKET}/`
  const idx = logo.indexOf(marker)
  if (idx === -1) return
  const path = logo.slice(idx + marker.length)
  try {
    await createAdminClient().storage.from(BUCKET).remove([path])
  } catch {
    // ignore storage cleanup failures
  }
}

function revalidate(): void {
  revalidatePath('/staff/clients')
  revalidatePath('/') // homepage "Trusted by" marquee
}

/** Add a client (name + optional logo). */
export async function createClient(_prev: ClientState, formData: FormData): Promise<ClientState> {
  await requirePortal('staff')
  const name = ((formData.get('name') as string | null) ?? '').trim()
  if (name.length < 2) return { error: 'Enter the client’s name.' }

  let logo: string | null = null
  const file = formData.get('file')
  if (file instanceof File && file.size > 0) {
    const up = await uploadLogo(name, file)
    if (up.error) return { error: up.error }
    logo = up.url ?? null
  }

  const count = await db.client.count()
  await db.client.create({ data: { name, logo, sortOrder: count } })
  revalidate()
  return { ok: true }
}

/** Replace a client's logo (uploads the new one, removes the old). */
export async function updateClientLogo(clientId: string, formData: FormData): Promise<ClientState> {
  await requirePortal('staff')
  const client = await db.client.findUnique({ where: { id: clientId }, select: { name: true, logo: true } })
  if (!client) return { error: 'Client not found.' }
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose a logo image.' }
  const up = await uploadLogo(client.name, file)
  if (up.error) return { error: up.error }
  await deleteStoredLogo(client.logo)
  await db.client.update({ where: { id: clientId }, data: { logo: up.url ?? null } })
  revalidate()
  return { ok: true }
}

/** Remove a client's logo (falls back to text name on the site). */
export async function removeClientLogo(clientId: string): Promise<void> {
  await requirePortal('staff')
  const client = await db.client.findUnique({ where: { id: clientId }, select: { logo: true } })
  await deleteStoredLogo(client?.logo ?? null)
  await db.client.update({ where: { id: clientId }, data: { logo: null } })
  revalidate()
}

/** Rename a client. */
export async function renameClient(clientId: string, name: string): Promise<ClientState> {
  await requirePortal('staff')
  const trimmed = name.trim()
  if (trimmed.length < 2) return { error: 'Enter a name.' }
  await db.client.update({ where: { id: clientId }, data: { name: trimmed } })
  revalidate()
  return { ok: true }
}

/** Toggle a client shown/hidden on the website. */
export async function toggleClient(id: string, active: boolean): Promise<void> {
  await requirePortal('staff')
  await db.client.update({ where: { id }, data: { active } })
  revalidate()
}

/** Delete a client (and its stored logo). */
export async function deleteClient(id: string): Promise<void> {
  await requirePortal('staff')
  const c = await db.client.findUnique({ where: { id }, select: { logo: true } })
  await deleteStoredLogo(c?.logo ?? null)
  await db.client.delete({ where: { id } })
  revalidate()
}
