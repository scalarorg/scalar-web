import { Clipboard } from "@/components/common";
import { ChainIcon } from "@/components/common/chain-icon";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SupportedChains } from "@/types/chains";
import { TProtocolDetails } from "@/types/types";
import { Link } from "@tanstack/react-router";
import { PROTOCOL_STATUS } from "../constans";

type ProtocolCardProps = {
  data: TProtocolDetails;
};

export const ProtocolCard = ({ data }: ProtocolCardProps) => {
  const { name, asset, status, chains } = data;

  const { label, variant, className } = PROTOCOL_STATUS.OBJECT[status];

  return (
    <div className='main-card-shadow flex h-[260px] flex-col gap-4 rounded-lg p-4'>
      <div className='flex items-center gap-2'>
        <Link
          to='/protocols/$slug'
          params={{ slug: name || "" }}
          className='truncate font-semibold text-text-primary-500 text-xl hover:text-text-link'
        >
          {name}
        </Link>
        <ChainIcon
          chain={asset?.chain as SupportedChains}
          showName
          classNames={{
            wrapper: "ml-auto w-fit shrink-0",
            icon: "size-5",
            name: "text-sm font-semibold"
          }}
        />
        <Badge variant={variant} className={cn("px-4 text-sm", className)} ghost>
          {label}
        </Badge>
      </div>
      <div className='flex grow flex-col divide-y overflow-auto border-hovering'>
        {chains?.map((chain) => (
          <div key={chain.chain} className='flex w-full items-center gap-5 py-2'>
            <div className='flex-1 overflow-hidden'>
              <Clipboard
                label={chain.address}
                text={chain.address || ""}
                classNames={{ text: "text-text-link" }}
              />
            </div>
            <ChainIcon
              chain={chain.chain as SupportedChains}
              showName
              classNames={{
                name: "text-text-primary-500 text-xs",
                wrapper: "w-[110px]",
                icon: "size-4"
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProtocolCardSkeleton = () => (
  <div className='main-card-shadow flex h-[260px] flex-col gap-4 rounded-lg p-4'>
    <div className='flex h-[30px] items-center gap-2'>
      <Skeleton className='h-full w-[100px]' />
      <Skeleton className='ml-auto h-full w-[100px]' />
      <Skeleton className='h-full w-[100px] rounded-full' />
    </div>
    <Skeleton className='grow' />
  </div>
);
