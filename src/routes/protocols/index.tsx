import NoteIcon from "@/assets/icons/note.svg";
import {
  Clipboard,
  DataTable,
  Heading,
  InputSearchBox,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { COMMON_VALIDATE_PAGE_SEARCH_PARAMS } from "@/constants";
import { PROTOCOL_STATUS, ProtocolForm } from "@/features/protocol";
import { useScalarProtocols } from "@/hooks";
import { cn, fuzzyMatch } from "@/lib/utils";
import { TProtocolDetails } from "@/types/protocol";
import { Link, createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/protocols/")({
  component: Protocols,
  validateSearch: COMMON_VALIDATE_PAGE_SEARCH_PARAMS,
});

const { display, accessor } = createColumnHelper<TProtocolDetails>();

const columns = [
  accessor("asset.name", {
    header: "Protocol",
    cell: ({ getValue }) => {
      const name = getValue();

      return (
        name && (
          <Button asChild>
            <Link
              to="/protocols/$slug"
              className="text-lg text-primary"
              params={{ slug: name }}
            >
              {name}
            </Link>
          </Button>
        )
      );
    },
  }),
  display({
    id: "token",
    header: "Token",
    cell: ({ row }) => {
      const { chain } = row.original?.asset || {};

      return chain || "No token";
    },
  }),
  accessor("chains", {
    id: "address",
    header: "Address",
    cell: ({ getValue }) => {
      const chains = getValue()?.filter((c) => c.address);

      return (
        <div className="flex flex-col gap-1">
          {chains?.map(({ address }) => (
            <Clipboard
              key={address}
              className="[&_span]:w-[150px] [&_span]:text-lg"
              label={address}
              text={address!}
            />
          ))}
        </div>
      );
    },
  }),
  accessor("chains", {
    id: "network",
    header: "Network",
    cell: ({ getValue }) => {
      const chains = getValue();

      return (
        <p>{chains?.map(({ name, chain }) => name || chain).join(", ")}</p>
      );
    },
  }),
  accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue();
      const findStatus = PROTOCOL_STATUS.OBJECT[status];

      return (
        findStatus?.label && (
          <div
            className={cn(
              "mx-auto flex w-fit items-center justify-center rounded-full px-4 py-1 text-lg text-white",
              findStatus.className,
            )}
          >
            <span>{findStatus.label}</span>
          </div>
        )
      );
    },
    meta: {
      className: "text-center",
    },
  }),
];

function Protocols() {
  const [open, setOpen] = useState(false);
  const { q } = Route.useSearch();

  const { data, isLoading, isRefetching } = useScalarProtocols();

  const filteredProtocols = useMemo(
    () =>
      data?.protocols?.filter((protocol) =>
        fuzzyMatch(protocol.asset?.name || "", q || ""),
      ),
    [data?.protocols, q],
  );

  return (
    <div className="flex flex-col gap-5 py-[60px]">
      <Heading>All Protocols</Heading>
      <Card className="p-0">
        <CardContent className="flex items-center gap-6 p-4">
          <div className="flex size-[70px] items-center justify-center rounded-lg bg-[#EDF1FF]">
            <NoteIcon />
          </div>
          <p className="mr-auto text-lg">Rigister your protocol.</p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="black" className="px-5 text-lg">
                Register
              </Button>
            </DialogTrigger>
            <DialogContent closeClassName="[&_svg:not([class*='size-'])]:size-6">
              <DialogHeader>
                <DialogTitle className="text-3xl">New Protocol</DialogTitle>
                <DialogDescription>
                  <ProtocolForm setOpen={setOpen} />
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <Card className="p-0">
        <CardContent className="flex flex-col gap-4 p-4">
          <InputSearchBox />
          <DataTable
            columns={columns}
            data={filteredProtocols as TProtocolDetails[]}
            pagination={{}}
            showPagination={false}
            isLoading={isLoading}
            isRefetching={isRefetching}
          />
        </CardContent>
      </Card>
    </div>
  );
}
