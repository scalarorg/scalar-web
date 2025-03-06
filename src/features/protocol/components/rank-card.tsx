import { cn } from "@/lib/utils";
import { RankItem, type TRankItem } from "./rank-item";

export type TRankCardProps = {
  title: string;
  description: string;
  data: TRankItem[];
  className?: Partial<{
    container: string;
    title: string;
    description: string;
  }>;
};

export const RankCard = ({
  title,
  description,
  data,
  className,
}: TRankCardProps) => {
  return (
    <div
      data-slot="rank-card"
      className={cn("flex flex-col gap-2", className?.container)}
    >
      <p className={cn("font-semibold text-[34px]", className?.title)}>
        {title}
      </p>
      <p className={cn("text-lg", className?.description)}>{description}</p>
      <div className="mt-auto rounded-lg border py-6">
        {data.map((item, index) => (
          <RankItem key={item.value} {...item} rank={index + 1} />
        ))}
      </div>
    </div>
  );
};
