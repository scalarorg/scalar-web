import DEFAULT_ICON from "@/assets/images/default-icon.png";
import { addBase64Prefix, formatNumber } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export type TCompareData = {
  largeAvatar: string;
  smallAvatar: string;
  value: number;
};

export type TInfoData = {
  avatar: string;
  name: string;
  value: number;
};
export type TTopCardProps = {
  title: string;
  description: string;
} & (
  | { type: "compare"; data: TCompareData[] }
  | { type: "info"; data: TInfoData[] }
);

const isCompareData = (
  item: TCompareData | TInfoData,
): item is TCompareData => {
  return (item as TCompareData).largeAvatar !== undefined;
};

export const TopCard = ({ title, description, data }: TTopCardProps) => {
  return (
    <div data-slot="top-card" className="h-full rounded-lg border p-6">
      <p className="font-semibold text-lg">{title}</p>
      <p className="text-lg">{description}</p>
      <div className="mt-5 space-y-5 text-lg">
        {data.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <div key={index} className="flex items-start justify-between gap-2">
            <div className="i tems-center flex gap-2">
              {isCompareData(item) ? (
                <>
                  <img
                    className="size-6 rounded-full"
                    src={
                      item.largeAvatar
                        ? addBase64Prefix(item.largeAvatar)
                        : DEFAULT_ICON
                    }
                    alt="Avatar"
                  />
                  <ChevronRight className="mx-1 size-5" />
                  <img
                    className="size-6 rounded-full"
                    src={
                      item.smallAvatar
                        ? addBase64Prefix(item.smallAvatar)
                        : DEFAULT_ICON
                    }
                    alt="Avatar"
                  />
                </>
              ) : (
                <>
                  <img
                    className="size-6 rounded-full"
                    src={
                      item.avatar ? addBase64Prefix(item.avatar) : DEFAULT_ICON
                    }
                    alt="Avatar"
                  />
                  <p>{item.name}</p>
                </>
              )}
            </div>
            <p className="font-medium">{formatNumber(item.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
