/**
 * Safe clipboard write that works even when the Clipboard API is blocked
 * by a permissions policy (e.g. inside iframes / Figma preview).
 *
 * Strategy:
 * 1. Try the modern Clipboard API first
 * 2. Try the legacy textarea + execCommand approach
 * 3. Fall back to window.prompt so the user can manually Ctrl+C
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Try the modern Clipboard API first.
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Blocked by permissions policy — fall through
  }

  // 2. Try the legacy textarea + execCommand approach.
  //    This works in some sandboxed iframes where the Clipboard API is blocked.
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Prevent scrolling / visual flash
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', ''); // prevent keyboard on mobile
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    // Ensure selection on iOS
    textarea.setSelectionRange(0, text.length);

    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (ok) return true;
  } catch {
    // execCommand not available — fall through
  }

  // 3. Last resort: show a prompt dialog so the user can manually copy.
  //    The text is pre-selected in the prompt's input field.
  try {
    window.prompt('Copy this link (Ctrl+C / Cmd+C):', text);
    // We can't know if they actually copied, but assume they did
    return true;
  } catch {
    // prompt blocked too
  }

  return false;
}
