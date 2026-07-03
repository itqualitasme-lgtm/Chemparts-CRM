import { redirect } from 'next/navigation'

// Consolidated into the single universal /login page.
export default function VendorLoginRedirect() {
  redirect('/login')
}
