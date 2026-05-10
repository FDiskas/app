import { useState } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      setCopiedText(text);
      setTimeout(() => {
        setCopied(false);
        setCopiedText(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return { copied, copiedText, copy };
}
