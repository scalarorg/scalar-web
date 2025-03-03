import BTCIcon from "@/assets/icons/btc.svg";
import EVMIcon from "@/assets/icons/evm.svg";
import { usePathname } from "@/hooks";
import { cn } from "@/lib/utils";
import { useWalletInfo } from "@/providers/wallet-provider";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import { ConnectBtc } from "./connect-btc";
import { ConnectEvm } from "./connect-evm";

export const ConnectDropdown = () => {
  const { isConnected: isConnectedBtc } = useWalletInfo();
  const { isConnected: isConnectedEvm } = useAccount();
  const pathname = usePathname();

  const isBridgePage = pathname === "/";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="black" className={cn(!isBridgePage && "hidden")}>
          <BTCIcon className={cn("!h-6", !isConnectedBtc && "text-[#555]")} />
          <Separator orientation="vertical" className="bg-[#555]" />
          <EVMIcon className={cn("!h-6", !isConnectedEvm && "text-[#555]")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[350px] shadow-md" align="end">
        <DropdownMenuItem className="focus:bg-transparent">
          <ConnectBtc />
        </DropdownMenuItem>
        <DropdownMenuItem className="focus:bg-transparent">
          <ConnectEvm />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
