// Temporary access gate. While the customer store/portal is being finalised we
// allow ONLY Chemparts staff to sign in; customers see an "under maintenance"
// notice and registration is closed. Flip CUSTOMER_PORTAL_ENABLED to true (and
// redeploy) to reopen the customer portal.
export const CUSTOMER_PORTAL_ENABLED = false

export const MAINTENANCE_MESSAGE =
  'The customer portal is temporarily under maintenance. Please check back soon — for anything urgent, email info@chemparts-me.com or WhatsApp +971 55 756 6123.'

/** Roles considered "Chemparts staff" (internal), allowed in during maintenance. */
export function isStaffRole(role: string): boolean {
  return role === 'STAFF' || role === 'ADMIN'
}
