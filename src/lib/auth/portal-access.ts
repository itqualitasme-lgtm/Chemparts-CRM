// Temporary access gate for the customer portal.
//
// For now: customers CAN register (which signs them in on completion), but the
// standalone customer sign-in is paused — only Chemparts staff can use the
// /login flow. Flip these flags (and redeploy) to change that.
export const CUSTOMER_REGISTRATION_ENABLED = true
export const CUSTOMER_LOGIN_ENABLED = false

export const MAINTENANCE_MESSAGE =
  'Customer sign-in is temporarily paused — please check back soon. For anything urgent, email info@chemparts-me.com or WhatsApp +971 55 756 6123.'

/** Roles considered "Chemparts staff" (internal), always allowed to sign in. */
export function isStaffRole(role: string): boolean {
  return role === 'STAFF' || role === 'ADMIN'
}
