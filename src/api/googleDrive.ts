import type { DriveFile } from './types'

export const signIn = async (): Promise<void> => {
  const gapi = (window as any).gapi
  await gapi.load('client:auth2')
  await gapi.client.init({
    apiKey: import.meta.env.VITE_GAPI_API_KEY,
    clientId: import.meta.env.VITE_GAPI_CLIENT_ID,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    scope: 'https://www.googleapis.com/auth/drive.readonly'
  })
  await gapi.auth2.getAuthInstance().signIn()
}

export const listFiles = async (): Promise<DriveFile[]> => {
  const gapi = (window as any).gapi
  const res = await gapi.client.drive.files.list({
    fields: 'files(id,name,webViewLink)'
  })
  const files = res.result.files || []
  return files.map((f: any) => ({ id: f.id, name: f.name, url: f.webViewLink }))
}
