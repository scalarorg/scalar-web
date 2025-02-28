import ProtocolIcon from "@/assets/icons/protocol.svg";
import ScaleIcon from "@/assets/icons/scalar.svg";
import ThunderIcon from "@/assets/icons/thunder.svg";
import WrapIcon from "@/assets/icons/wrap.svg";
import { ValidRoutes } from "@/types/routers";
import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";

type Props = {
  extra?: ReactNode;
};

const linkClassName =
  "flex items-center gap-3 font-semibold [&.active]:text-primary hover:text-primary text-[#767676] transition-colors duration-300";

const links: {
  to: ValidRoutes;
  label: string;
  icon: ReactNode;
}[] = [
  { to: "/", label: "BRIDGE", icon: <ThunderIcon /> },
  { to: "/protocols", label: "PROTOCOL", icon: <ProtocolIcon /> },
  { to: "/explore", label: "EXPLORE", icon: <WrapIcon /> },
];

export const Header = ({ extra }: Props) => {
  return (
    <header className="container flex items-center justify-between gap-2 py-6">
      <div className="flex items-center gap-[60px]">
        <ScaleIcon />
        {links.map(({ to, label, icon }) => (
          <Link key={to} to={to} className={linkClassName}>
            {icon}
            {label}
          </Link>
        ))}
      </div>
      {extra}
    </header>
  );
};
