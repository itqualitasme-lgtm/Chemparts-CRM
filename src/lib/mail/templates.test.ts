import { describe, expect, it } from 'vitest'
import { renderEmail } from './templates'

describe('renderEmail', () => {
  it('wraps body in branded layout with subject and footer', () => {
    const { subject, html } = renderEmail('welcome', { name: 'Ali', portalUrl: 'https://x/account' })
    expect(subject).toContain('Welcome')
    expect(html).toContain('Ali')
    expect(html).toContain('CHEMPARTS')
    expect(html).toContain('https://x/account')
    expect(html).toContain('no-reply') // footer notice
  })

  it('escapes HTML in variables', () => {
    const { html } = renderEmail('welcome', { name: '<script>x</script>', portalUrl: 'https://x' })
    expect(html).not.toContain('<script>x</script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('throws on unknown template', () => {
    expect(() => renderEmail('nope', {})).toThrow(/Unknown email template/)
  })
})
