import 'server-only'
import nodemailer from 'nodemailer'
import { db } from '@/lib/db'
import { renderEmail } from './templates'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: Number(process.env.SMTP_PORT ?? 465) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

export async function sendMail(
  to: string,
  template: string,
  vars: Record<string, string>,
  opts?: { cc?: string },
) {
  const { subject, html } = renderEmail(template, vars)
  const logTo = opts?.cc ? `${to} (cc ${opts.cc})` : to
  try {
    await transporter.sendMail({ from: process.env.MAIL_FROM, to, cc: opts?.cc, subject, html })
    await db.emailLog.create({ data: { to: logTo, subject, template, status: 'SENT' } })
  } catch (err) {
    await db.emailLog.create({
      data: { to: logTo, subject, template, status: 'FAILED', error: String(err) },
    })
    throw err
  }
}
