// Keycloak OIDC (Authorization Code + PKCE) login, including passkey/biometric —
// Keycloak owns the passkey ceremony; the client just runs the redirect flow and
// uses the returned access token as the existing Bearer.
//
// Gated behind VITE_OIDC_ISSUER: when unset, OIDC is OFF and legacy /auth/login
// stays the only path. Wire/test once the Keycloak realm (#112) is deployed.
import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts'
import { setSession } from './auth'

const issuer = import.meta.env.VITE_OIDC_ISSUER as string | undefined
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID as string | undefined

export const oidcEnabled = !!issuer && !!clientId

let manager: UserManager | null = null
function mgr(): UserManager {
  if (!manager) {
    manager = new UserManager({
      authority: issuer!,
      client_id: clientId!,
      redirect_uri: `${location.origin}/auth/callback`,
      post_logout_redirect_uri: location.origin,
      response_type: 'code', // PKCE is automatic for public clients
      scope: 'openid profile',
      automaticSilentRenew: true,
      userStore: new WebStorageStateStore({ store: window.localStorage }),
    })
  }
  return manager
}

/** Kick off the redirect to Keycloak (which prompts passkey/Face ID/fingerprint). */
export function loginWithPasskey(): Promise<void> {
  return mgr().signinRedirect()
}

/** Handle the /auth/callback redirect: exchange code → token → session. */
export async function handleCallback(): Promise<void> {
  const user = await mgr().signinRedirectCallback()
  applyUser(user)
}

export async function oidcLogout(): Promise<void> {
  if (manager) await manager.signoutRedirect()
}

function applyUser(user: User | null) {
  if (user?.access_token) {
    setSession({ accessToken: user.access_token, refreshToken: user.refresh_token })
  }
}
