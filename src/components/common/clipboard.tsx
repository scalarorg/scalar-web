import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import { MouseEvent, useState } from "react";
import { toast } from "sonner";

interface ClipboardProps {
  text: string;
  label?: string;
  className?: string;
  onClick?: () => void;
  targetLink?: string;
  textClassName?: string;
}

export function Clipboard({
  text,
  label = "Copy",
  className,
  onClick,
  targetLink,
  textClassName,
}: ClipboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch (_err) {
      toast.error("Failed to copy text");
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "cursor-auto gap-1 px-0 hover:bg-transparent",
        )}
      >
        {targetLink ? (
          <a
            href={targetLink}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "w-[100px] truncate text-base text-primary",
              textClassName,
            )}
          >
            {label}
          </a>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className={cn(
              "w-[100px] truncate text-base text-primary",
              onClick && "cursor-pointer",
              textClassName,
            )}
          >
            {label}
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${label} to clipboard`}
          className="cursor-pointer"
        >
          {copied ? (
            <CheckIcon className="size-5" />
          ) : (
            <ClipboardIcon className="size-5" />
          )}
        </button>
      </div>
    </div>
  );
}
