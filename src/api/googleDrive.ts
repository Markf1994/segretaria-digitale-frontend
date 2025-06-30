import type { DriveFile } from './types'

export const loadClient = async (): Promise<void> => {
  const gapi = (window as any).gapi
  await gapi.load('client:auth2')
  await gapi.client.init({
    apiKey: import.meta.env.VITE_GAPI_API_KEY,
    clientId: import.meta.env.VITE_GAPI_CLIENT_ID,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    scope: 'https://www.googleapis.com/auth/drive.readonly',
  })
}

export const signIn = async (loginHint?: string): Promise<void> => {
  const gapi = (window as any).gapi
  if (!gapi.auth2 || !gapi.auth2.getAuthInstance()) {
    await loadClient()
  }
  await gapi.auth2
    .getAuthInstance()
    .signIn({ prompt: 'select_account', login_hint: loginHint })
}

export const listDriveFiles = async (): Promise<DriveFile[]> => {
  const gapi = (window as any).gapi
  const res = await gapi.client.drive.files.list()
  return res.result.files || []
}
