const AUTH_STORAGE_KEY = 'legalhub-auth'

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true'
}

export function login(): void {
  sessionStorage.setItem(AUTH_STORAGE_KEY, 'true')
}

export function logout(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}
