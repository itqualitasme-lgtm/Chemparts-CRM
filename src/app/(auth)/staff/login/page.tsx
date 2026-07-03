import LoginForm from '@/components/auth/LoginForm'

export const metadata = { title: 'Staff sign in — Chemparts' }

export default function StaffLoginPage() {
  return (
    <LoginForm
      portal="staff"
      title="Staff sign in"
      subtitle="Chemparts staff and administrators."
    />
  )
}
