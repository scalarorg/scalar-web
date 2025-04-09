import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const ConnectEvm = ({
  hideTitle,
  className,
}: {
  hideTitle?: boolean;
  className?: string;
}) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {!hideTitle && (
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-lg">EVM</span>
        </div>
      )}
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === "authenticated");

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button
                      onClick={openConnectModal}
                      type="button"
                      className={cn("w-full", className)}
                      size="lg"
                    >
                      Connect wallet
                    </Button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <Button
                      onClick={openChainModal}
                      type="button"
                      className="w-full"
                    >
                      Wrong network
                    </Button>
                  );
                }

                return (
                  <div className="flex gap-3">
                    <Button
                      onClick={openChainModal}
                      className="flex items-center"
                      type="button"
                      variant="outline"
                    >
                      {chain.hasIcon && (
                        <div className="mr-1 size-3 overflow-hidden rounded-full">
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              className="size-3"
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </Button>

                    <Button
                      onClick={openAccountModal}
                      type="button"
                      className="grow"
                      variant="outline"
                    >
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ""}
                    </Button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};
