const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'

export function generateUniqueId(
  taken: Set<string>,
  length: number = 8,
  getRandomValues = crypto.getRandomValues.bind(crypto),
): string {
  const getId = (): string => {
    return Array.from(getRandomValues(new Uint8Array(length)), (byte) => {
      return alphabet[byte % alphabet.length]!
    }).join('')
  }
  let id = getId()
  while (taken.has(id)) {
    id = getId()
  }
  return id
}
