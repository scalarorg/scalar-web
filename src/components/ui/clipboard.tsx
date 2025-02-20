import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import { useState } from "react";

interface ClipboardProps {
  text: string;
  label?: string;
  className?: string;
}

export function Clipboard({ text, label = "Copy", className }: ClipboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 hover:bg-transparent"
        onClick={handleCopy}
        aria-label={`Copy ${label} to clipboard`}
      >
        <span className="w-[100px] truncate text-primary">{label}</span>
        {copied ? (
          <CheckIcon className="size-5" />
        ) : (
          <ClipboardIcon className="size-5" />
        )}
      </Button>
    </div>
  );
}
