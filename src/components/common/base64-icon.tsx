import DEFAULT_ICON from "@/assets/images/default-icon.png";
import { addBase64Prefix, cn } from "@/lib/utils";

export const Base64Icon = ({
  url,
  className,
}: { url?: string; className?: string }) => {
  return (
    <img
      src={url ? addBase64Prefix(url) : DEFAULT_ICON}
      className={cn("size-5 rounded-full", className)}
      alt="Icon"
    />
  );
};
