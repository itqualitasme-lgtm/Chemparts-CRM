import LoginForm from '@/components/auth/LoginForm'

export const metadata = { title: 'Vendor sign in — Chemparts' }

export default function VendorLoginPage() {
  return (
    <LoginForm
      portal="vendor"
      title="Vendor sign in"
      subtitle="View purchase orders and submit your bills."
    />
  )
}
