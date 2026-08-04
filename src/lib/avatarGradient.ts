const GRADIENTS = [
  'from-[#1a5c3a] to-[#2d7a4f]',
  'from-purple-500 to-purple-700',
  'from-blue-500 to-blue-700',
  'from-orange-400 to-orange-600',
  'from-rose-400 to-rose-600',
]

export function avatarGradient(name: string | undefined | null) {
  if (!name) return GRADIENTS[0]
  const sum = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return GRADIENTS[sum % GRADIENTS.length]
}
