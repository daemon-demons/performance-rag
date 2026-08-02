export const CLIENT_COLORS = {
  'Client Q': '#3253DC',
  'Client G': '#EA4335',
  'Client A': '#636466',
}

export const CLIENT_COLOR_FALLBACK = '#94a3b8'

export function clientColor(client) {
  return CLIENT_COLORS[client] || CLIENT_COLOR_FALLBACK
}
