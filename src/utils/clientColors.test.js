import { describe, expect, it } from 'vitest'
import { CLIENT_COLORS, clientColor } from './clientColors'

describe('clientColors', () => {
  it('maps Q/G/A brand colors', () => {
    expect(CLIENT_COLORS['Client Q']).toBe('#3253DC')
    expect(CLIENT_COLORS['Client G']).toBe('#EA4335')
    expect(CLIENT_COLORS['Client A']).toBe('#636466')
    expect(clientColor('Client Q')).toBe('#3253DC')
    expect(clientColor('Unknown')).toMatch(/^#/)
  })
})
