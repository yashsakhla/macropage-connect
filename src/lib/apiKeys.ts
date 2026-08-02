const STORAGE_KEY = 'recently-created-api-key-ids'

function readIds(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function markApiKeyRecentlyCreated(id: string) {
  const ids = readIds()
  if (!ids.includes(id)) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, id]))
  }
}

export function isApiKeyRecentlyCreated(id: string) {
  return readIds().includes(id)
}
