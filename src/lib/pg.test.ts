import { describe, expect, it } from 'vitest'
import { withNoVerifySsl } from './pg'

describe('withNoVerifySsl', () => {
  it('replaces sslmode=require with no-verify, preserving other params and password', () => {
    const cs =
      'postgresql://postgres.abcref:p%40ss-w0rd@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1'
    const out = withNoVerifySsl(cs)
    expect(out).toContain('sslmode=no-verify')
    expect(out).not.toContain('sslmode=require')
    expect(out).toContain('pgbouncer=true')
    expect(out).toContain('connection_limit=1')
    expect(out).toContain('p%40ss-w0rd') // encoded password preserved
    expect(out).toContain('postgres.abcref')
  })

  it('adds sslmode when none is present', () => {
    const out = withNoVerifySsl('postgresql://u:p@host:5432/postgres')
    expect(out).toContain('sslmode=no-verify')
  })

  it('collapses uselibpqcompat and duplicate sslmode', () => {
    const cs = 'postgresql://u:p@host:5432/postgres?sslmode=verify-full&uselibpqcompat=true'
    const out = withNoVerifySsl(cs)
    expect(out).toContain('sslmode=no-verify')
    expect(out).not.toContain('verify-full')
    expect(out).not.toContain('uselibpqcompat')
  })
})
