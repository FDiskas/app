import { useState } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  const copy = async (text: string) => {
    if (!navigator.clipboard || !window.isSecureContext) {
      setCopyError("Clipboard is unavailable in this browser context.");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopiedText(text);
      setCopyError(null);
      setTimeout(() => {
        setCopied(false);
        setCopiedText(null);
      }, 2000);
      return true;
    } catch (err) {
      console.error("Failed to copy", err);
      setCopyError("Failed to copy text to clipboard.");
      return false;
    }
  };

  return { copied, copiedText, copyError, copy };
}
