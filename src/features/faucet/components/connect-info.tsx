import DiscordIcon from "@/assets/icons/discord.svg";
import XIcon from "@/assets/icons/x.svg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ConnectInfo = () => {
  return (
    <div className="space-y-7.5">
      <div
        className={cn(
          // Vertical spacing between child elements
          "space-y-6",

          // Apply styles to elements with data-slot="button"
          "[&>[data-slot=button]]:bg-background-secondary",
          "[&>[data-slot=button]]:w-full",
          "[&>[data-slot=button]]:border-none",
        )}
      >
        <p className="text-center font-semibold">
          Connect your social media accounts to get more tokens!
        </p>
        <Button type="button" size="lg" variant="outline">
          <XIcon className="h-4" />
          Connect X
        </Button>
        <Button type="button" size="lg" variant="outline">
          <DiscordIcon className="h-4" />
          Connect Discord
        </Button>
      </div>
      <p className="text-center">
        New here? <span className="underline">Add Testnet</span> to your wallet.
      </p>
    </div>
  );
};
