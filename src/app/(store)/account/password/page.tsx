import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/session'
import { isOtpGraceActive } from '@/lib/auth/otp-grace'
import PasswordChangeForm from './PasswordChangeForm'

export const metadata = { title: 'Change password — Chemparts' }
export const dynamic = 'force-dynamic'

export default async function AccountPasswordPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  if (user.role !== 'CUSTOMER') redirect('/')

  const graceActive = await isOtpGraceActive()

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Change password</h1>
      <p className="mb-6 text-slate-500">
        Set a new password for your account. You don’t need your current password — just verify with
        a one-time email code.
      </p>
      <PasswordChangeForm graceActive={graceActive} />
    </div>
  )
}
