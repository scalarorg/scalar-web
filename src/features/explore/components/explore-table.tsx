import {
  friendlyFormatDate,
  handle0xString,
  isBtcChain,
  isEvmChain,
} from "@/lib/utils";

import { Clipboard, DataTable } from "@/components/common";
import { usePathname } from "@/hooks";
import { Chains } from "@/lib/chains";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { CROSS_CHAIN_STATUS } from "../constants";
import { TExplore, TExploreList } from "../models";

const { display, accessor } = createColumnHelper<TExplore>();

const handleChain = (chain: string, text: string) => {
  const { remove, add } = handle0xString(text);

  const label = remove;
  const link = isBtcChain(chain) ? remove : isEvmChain(chain) ? add : text;

  return { label, link };
};

type Props = {
  data: TExploreList;
  isLoading: boolean;
  isRefetching: boolean;
  size: number;
  offset: number;
};

export const ExploreTable = ({
  data,
  isLoading,
  isRefetching,
  size,
  offset,
}: Props) => {
  const pathname = usePathname();
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      display({
        id: "source-tx-hash",
        header: "Source Tx Hash",
        cell: ({ row }) => {
          const { tx_hash, chain } = row.original.source;
          const { blockExplorerIcon, blockExplorer } = Chains[chain] || {};

          const { label, link } = handleChain(chain, tx_hash);
          const newLink = blockExplorer && `${blockExplorer}/tx/${link}`;

          return (
            <div className="flex items-center gap-2">
              <Clipboard
                label={label}
                text={label}
                classNames={{ wrapper: "max-w-[200px]" }}
                onClick={() =>
                  navigate({
                    to: `${pathname}/${tx_hash}`,
                  })
                }
              />
              {newLink && blockExplorerIcon && (
                <a
                  href={newLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-5 rounded-full"
                >
                  <img src={blockExplorerIcon} alt="block explorer icon" />
                </a>
              )}
            </div>
          );
        },
      }),
      accessor("source", {
        header: "Source",
        cell: ({ getValue }) => {
          const { chain_name, sender, chain } = getValue();
          const { icon, blockExplorer } = Chains[chain] || {};
          const link = blockExplorer && `${blockExplorer}/address/${sender}`;

          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {icon && (
                  <img
                    src={icon}
                    alt={chain_name}
                    className="size-5 rounded-full"
                  />
                )}
                <p className="whitespace-nowrap">{chain_name}</p>
              </div>
              <Clipboard
                targetLink={link}
                label={sender}
                text={sender}
                classNames={{ wrapper: "max-w-[200px]" }}
              />
            </div>
          );
        },
      }),
      // display({
      //   id: "destination-tx-hash",
      //   header: "Destination Tx Hash",
      //   cell: ({ row }) => {
      //     const { tx_hash, chain } = row.original.destination;
      //     const { blockExplorerIcon, blockExplorer } = Chains[chain] || {};

      //     const { label, link } = handleChain(chain, tx_hash);
      //     const newLink = blockExplorer && `${blockExplorer}/tx/${link}`;

      //     return (
      //       tx_hash &&
      //       chain && (
      //         <div className="flex items-center gap-2">
      //           <Clipboard
      //             label={label}
      //             text={label}
      //             classNames={{ wrapper: "max-w-[200px]" }}
      //           />
      //           {newLink && blockExplorerIcon && (
      //             <a
      //               href={newLink}
      //               target="_blank"
      //               rel="noopener noreferrer"
      //               className="size-5 rounded-full"
      //             >
      //               <img src={blockExplorerIcon} alt="block explorer icon" />
      //             </a>
      //           )}
      //         </div>
      //       )
      //     );
      //   },
      // }),
      accessor("destination", {
        header: "Destination",
        cell: ({ getValue }) => {
          const { chain_name, receiver, chain } = getValue();
          const { icon, blockExplorer } = Chains[chain] || {};
          const link = blockExplorer && `${blockExplorer}/address/${receiver}`;

          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {icon && (
                  <img
                    src={icon}
                    alt={chain_name}
                    className="size-5 rounded-full"
                  />
                )}
                <p className="whitespace-nowrap">{chain_name}</p>
              </div>
              <Clipboard
                targetLink={link}
                label={receiver}
                text={receiver}
                classNames={{ wrapper: "max-w-[200px]" }}
              />
            </div>
          );
        },
      }),
      // accessor("type", {
      //   header: "Method",
      //   cell: ({ getValue }) => {
      //     const type = getValue();

      //     return <p className="capitalize">{type}</p>;
      //   },
      // }),
      accessor("status", {
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          const { label, className } = CROSS_CHAIN_STATUS.OBJECT[status];

          return (
            <div
              className={cn(
                "rounded-full px-3 py-1 text-sm text-white",
                className,
              )}
            >
              {label}
            </div>
          );
        },
        meta: {
          className: "text-center",
        },
      }),
      accessor("source.created_at", {
        header: "Created at",
        cell: ({ getValue }) => {
          const created_at = getValue();

          return (
            <p className="w-[130px]">
              {friendlyFormatDate(created_at)}
            </p>
          );
        },
      }),
    ],
    [pathname, navigate],
  );

  return (
    <DataTable
      columns={columns}
      data={data?.data || []}
      isLoading={isLoading}
      isRefetching={isRefetching}
      pageCount={Math.ceil((data?.total ?? 0) / size)}
      pagination={{
        pageIndex: offset + 1,
        pageSize: size,
      }}
    />
  );
};
