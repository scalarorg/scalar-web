import ProtocolIcon from "@/assets/icons/protocol.svg";
import ScaleIcon from "@/assets/icons/scalar.svg";
import ThunderIcon from "@/assets/icons/thunder.svg";
import WrapIcon from "@/assets/icons/wrap.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "@/hooks";
import { cn } from "@/lib/utils";
import { ValidRoutes } from "@/types/routers";
import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";

type Props = {
  extra?: ReactNode;
};

const linkClassName =
  "flex items-center gap-3 font-semibold [&.active]:text-primary hover:text-primary text-[#767676] transition-colors duration-300 cursor-pointer";

const links: (
  | {
      to: ValidRoutes;
      label: string;
      icon: ReactNode;
    }
  | {
      pathname: ValidRoutes;
      subLinks: {
        to: ValidRoutes;
        label: string;
      }[];
      label: string;
      icon: ReactNode;
    }
)[] = [
  { to: "/", label: "BRIDGE", icon: <ThunderIcon /> },
  { to: "/protocols", label: "PROTOCOL", icon: <ProtocolIcon /> },
  {
    pathname: "/explore",
    label: "EXPLORER",
    icon: <WrapIcon />,
    subLinks: [
      { to: "/explore/bridge", label: "Bridge" },
      { to: "/explore/transfer", label: "Transfer" },
      { to: "/explore/redeem", label: "Redeem" },
      { to: "/explore/statistic", label: "Statistic" },
    ],
  },
];

export const Header = ({ extra }: Props) => {
  const pathname = usePathname();

  return (
    <header className="container flex items-center justify-between gap-2 py-6">
      <div className="flex items-center gap-[60px]">
        <ScaleIcon />
        {links.map((link) => {
          if ("to" in link) {
            return (
              <Link key={link.to} to={link.to} className={linkClassName}>
                {link.icon}
                {link.label}
              </Link>
            );
          }

          return (
            <DropdownMenu key={link.label}>
              <DropdownMenuTrigger
                asChild
                className="focus-visible:outline-none"
              >
                <button
                  type="button"
                  className={cn(
                    linkClassName,
                    pathname.includes(link.pathname) && "text-primary",
                  )}
                >
                  {link.icon}
                  {link.label}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {link.subLinks.map((subLink) => (
                  <DropdownMenuItem key={subLink.to} asChild>
                    <Link to={subLink.to} className="!text-lg cursor-pointer">
                      {subLink.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>
      {extra}
    </header>
  );
};
