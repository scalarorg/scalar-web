import { Button } from "@/components/ui/button";
import { type EExploreType, EXPLORE_TYPE } from "@/features/explore";
import { Link } from "@tanstack/react-router";

type Props = {
  type: EExploreType;
};

export function ExploreLinks({ type }: Props) {
  return (
    <div className="flex gap-4">
      {EXPLORE_TYPE.LIST.map((item) => (
        <Link key={item.value} to={item.path}>
          <Button
            variant={type === item.value ? "default" : "tab_link"}
            className="min-w-[150px] font-semibold text-base"
          >
            {item.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}
