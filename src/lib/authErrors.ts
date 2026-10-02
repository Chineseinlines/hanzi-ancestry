/** Supabase / 网络错误归类，供界面显示本地化的友好提示。 */
export type AuthErrorKind =
  | 'network'
  | 'invalidCredentials'
  | 'emailNotConfirmed'
  | 'userExists'
  | 'weakPassword'
  | 'invalidEmail'
  | 'rateLimited'
  | 'unknown';

/** 将原始错误信息归入可本地化的类别；无法识别时返回 unknown。 */
export function classifyAuthError(raw?: string | null): AuthErrorKind {
  const m = (raw ?? '').toLowerCase();
  if (!m) return 'unknown';
  if (
    /failed to fetch|networkerror|network error|load failed|fetch failed|err_(connection|network|internet)|timeout|timed out|aborted|econn/.test(
      m,
    )
  ) {
    return 'network';
  }
  if (/invalid login credentials|invalid credentials|invalid_grant/.test(m)) return 'invalidCredentials';
  if (/email not confirmed|email_not_confirmed/.test(m)) return 'emailNotConfirmed';
  if (/already registered|already exists|already been registered|user_already_exists/.test(m)) return 'userExists';
  if (/password should be at least|password.*(too short|6 char)/.test(m)) return 'weakPassword';
  if (/unable to validate email|invalid email|email address.*invalid|email_address_invalid/.test(m)) {
    return 'invalidEmail';
  }
  if (/rate limit|too many requests|over_email_send_rate_limit|too many/.test(m)) return 'rateLimited';
  return 'unknown';
}

/** 返回本地化文案的 i18n 键。 */
export function authErrorKey(raw?: string | null): string {
  return `auth.errors.${classifyAuthError(raw)}`;
}