export function normalizePhoneNumber(phoneInput: string): string {
  // Strip all non-digit characters except maybe + at start
  const cleaned = phoneInput.replace(/[^\d+]/g, "");
  
  if (!cleaned) return "";

  // If it starts with a plus, keep it but clean internal pluses
  let formatted = cleaned.startsWith("+") ? "+" + cleaned.replace(/\+/g, "") : cleaned.replace(/\+/g, "");

  // If it is Nigerian local number (11 digits starting with '0')
  if (formatted.startsWith("0") && formatted.length === 11) {
    formatted = "+234" + formatted.substring(1);
  } else if (!formatted.startsWith("+")) {
    formatted = "+" + formatted;
  }

  return formatted;
}
