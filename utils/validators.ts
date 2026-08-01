// utils/validators.ts

// Matches Pakistani mobile numbers: 03XXXXXXXXX or +923XXXXXXXXX
export function isValidPkPhone(phone: string): boolean {
  const normalized = phone.trim();
  return /^(03\d{9}|\+923\d{9})$/.test(normalized);
}

// Normalizes phone to a single consistent format for storage/lookup: 03XXXXXXXXX
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+92")) {
    return "0" + trimmed.slice(3);
  }
  return trimmed;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Minimum 8 chars, at least one letter and one number
export function isValidPassword(password: string): boolean {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}