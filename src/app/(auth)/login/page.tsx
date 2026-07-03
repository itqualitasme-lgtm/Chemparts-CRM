import LoginForm from '@/components/auth/LoginForm'

export const metadata = { title: 'Customer sign in — Chemparts' }

export default function CustomerLoginPage() {
  return (
    <LoginForm
      portal="store"
      title="Customer sign in"
      subtitle="Access your quotations, orders and enquiries."
      showRegister
    />
  )
}
