import ScaleIcon from "@/assets/icons/scalar.svg";
import ThunderIcon from "@/assets/icons/thunder.svg";
import WrapIcon from "@/assets/icons/wrap.svg";
import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";

type Props = {
  extra?: ReactNode;
};

const linkClassName =
  "flex items-center gap-3 font-semibold [&.active]:text-primary hover:text-primary text-[#767676] transition-colors duration-300";

export const Header = ({ extra }: Props) => {
  return (
    <header className="container flex items-center justify-between gap-2 py-6">
      <div className="flex items-center gap-[60px]">
        <ScaleIcon />
        <Link to="/" className={linkClassName}>
          <ThunderIcon />
          HOME
        </Link>
        <Link to="/explore" className={linkClassName}>
          <WrapIcon />
          EXPLORE
        </Link>
      </div>
      {extra}
    </header>
  );
};
