import DEFAULT_ICON from "@/assets/images/default-icon.png";
import { Chains } from "@/lib/chains";
import { cn } from "@/lib/utils";
import { SupportedChains } from "@/types/chains";

export const ChainIcon = ({
  chain,
  className,
}: {
  chain: SupportedChains;
  className?: string;
}) => {
  return (
    <img
      src={Chains[chain]?.icon || DEFAULT_ICON}
      alt={chain}
      className={cn("size-6 rounded-full", className)}
    />
  );
};
