const BLOB_URL = 'https://jsonblob.com/api/jsonBlob'

export function cloudPayload(store) {
  return {
    app: 'spellingBee7004',
    updatedAt: Date.now(),
    familyPinSalt: store.familyPinSalt || '',
    familyPinHash: store.familyPinHash || '',
    familyCloudId: store.familyCloudId || '',
    profiles: store.profiles || {},
  }
}

function blobIdFromResponse(res) {
  const header = res.headers.get('X-jsonblob') || res.headers.get('x-jsonblob')
  if (header) return header.trim()
  const location = res.headers.get('Location') || res.headers.get('location') || ''
  const parts = location.split('/').filter(Boolean)
  return parts[parts.length - 1] || ''
}

export function normalizeFamilyCode(value) {
  return String(value || '')
    .trim()
    .replace(/^https?:\/\/jsonblob\.com\/(api\/jsonBlob\/)?/i, '')
    .replace(/\s+/g, '')
}

export async function createFamilyCloud(store) {
  const res = await fetch(BLOB_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(cloudPayload(store)),
  })
  if (!res.ok) {
    throw new Error('Could not create a family cloud. You can still download a backup file.')
  }
  const id = blobIdFromResponse(res)
  if (!id) throw new Error('Family cloud did not return a code.')
  return id
}

export async function pullFamilyCloud(familyCloudId) {
  const id = normalizeFamilyCode(familyCloudId)
  if (!id) throw new Error('Enter a family code.')
  const res = await fetch(`${BLOB_URL}/${id}`, {
    headers: { Accept: 'application/json' },
  })
  if (res.status === 404) throw new Error('That family code was not found.')
  if (!res.ok) throw new Error('Could not load the family cloud.')
  const data = await res.json()
  if (!data || data.app !== 'spellingBee7004' || !data.profiles) {
    throw new Error('That code is not a Spelling Bee family backup.')
  }
  return { ...data, familyCloudId: id }
}

export async function pushFamilyCloud(store) {
  const id = store.familyCloudId
  if (!id) return
  const res = await fetch(`${BLOB_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...cloudPayload(store), familyCloudId: id }),
  })
  if (!res.ok) throw new Error('Could not save to the family cloud.')
}

export function downloadFamilyBackup(store) {
  const blob = new Blob([JSON.stringify(cloudPayload(store), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'spelling-bee-family.json'
  link.click()
  URL.revokeObjectURL(url)
}

export async function readFamilyBackupFile(file) {
  const text = await file.text()
  const data = JSON.parse(text)
  if (!data || !data.profiles) throw new Error('That file is not a family backup.')
  return data
}
