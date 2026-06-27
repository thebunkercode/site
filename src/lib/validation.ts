export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export interface ContactBody {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
}

export interface NotifyBody {
  email?: string;
}
