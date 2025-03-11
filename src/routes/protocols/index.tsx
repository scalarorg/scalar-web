import NoteIcon from "@/assets/icons/note.svg";
import WalletIcon from "@/assets/icons/wallet.svg";
import DEFAULT_ICON from "@/assets/images/default-icon.png";
import {
  Clipboard,
  DataTable,
  Heading,
  InputSearchBox,
} from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { COMMON_VALIDATE_PAGE_SEARCH_PARAMS } from "@/constants";
import { PROTOCOL_STATUS, ProtocolForm } from "@/features/protocol";
import { useScalarProtocols } from "@/hooks";
import { addBase64Prefix, cn, fuzzyMatch } from "@/lib/utils";
import { useAccount, useConnectKeplr } from "@/providers/keplr-provider";
import { TProtocolDetails } from "@/types/protocol";
import { fromBech32 } from "@cosmjs/encoding";
import { Link, createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { isEmpty } from "lodash";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/protocols/")({
  component: Protocols,
  validateSearch: COMMON_VALIDATE_PAGE_SEARCH_PARAMS,
});

const { display, accessor } = createColumnHelper<TProtocolDetails>();

const columns = [
  accessor("name", {
    header: "Protocol",
  }),
  display({
    id: "token",
    header: "Token",
    cell: ({ row }) => {
      const { chain } = row.original?.asset || {};
      const avatar = row.original?.avatar;

      return (
        <div className="flex items-center gap-2">
          <img
            src={avatar ? addBase64Prefix(avatar) : DEFAULT_ICON}
            className="size-5 rounded-full"
            alt="avatar"
          />
          <p>{chain}</p>
        </div>
      );
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
              className="[&_span]:w-[150px]"
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
        <p className="min-w-[250px]">
          {chains?.map(({ name, chain }) => name || chain).join(", ")}
        </p>
      );
    },
  }),
  accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue();
      const { label, variant, className } = PROTOCOL_STATUS.OBJECT[status];

      return (
        label && (
          <Badge
            variant={variant}
            className={cn("rounded-full px-4 text-base text-white", className)}
          >
            {label}
          </Badge>
        )
      );
    },
    meta: {
      className: "text-center",
    },
  }),
];

function Protocols() {
  const { isConnected, account } = useAccount();
  const { connect } = useConnectKeplr();
  const [open, setOpen] = useState(false);
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data, isLoading, isRefetching } = useScalarProtocols();

  const filteredProtocols = useMemo(
    () =>
      data?.protocols?.filter((protocol) =>
        fuzzyMatch(protocol?.name || "", q || ""),
      ),
    [data?.protocols, q],
  );

  const accountAddress = account?.address
    ? Buffer.from(fromBech32(account?.address).data).toString("base64")
    : "";

  const isOwnCreated = useMemo(() => {
    if (isEmpty(data?.protocols) || !accountAddress) return false;

    return data?.protocols?.some((p) => p.scalar_address === accountAddress);
  }, [data?.protocols, accountAddress]);

  return (
    <div className="flex flex-col gap-5 py-[60px]">
      <Heading>All Protocols</Heading>
      <Card className="rounded-lg p-0">
        <CardContent className="flex items-center gap-6 p-4">
          <div
            className={cn(
              // Flexbox Container
              "flex items-center justify-center",

              // Size
              "size-[70px]",

              // Border Radius
              "rounded-lg",

              // Color
              "bg-[#EDF1FF] text-text-primary-500",
            )}
          >
            {isConnected ? <NoteIcon /> : <WalletIcon />}
          </div>
          <p className="mr-auto text-text-primary-500">
            {isConnected
              ? isOwnCreated
                ? "You have created a protocol."
                : "Rigister your protocol."
              : "Connect your wallet to register protocol."}
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            {isConnected ? (
              isOwnCreated ? (
                <Link to="/protocols/me">
                  <Button size="lg">View your protocol</Button>
                </Link>
              ) : (
                <DialogTrigger asChild>
                  <Button variant="black" size="lg">
                    Register
                  </Button>
                </DialogTrigger>
              )
            ) : (
              <Button onClick={() => connect()} size="lg">
                Connect Scalar
              </Button>
            )}
            <DialogContent
              closeClassName="[&_svg:not([class*='size-'])]:size-6"
              className="min-w-[800px]"
            >
              <DialogHeader>
                <DialogTitle className="text-2xl">New Protocol</DialogTitle>
                <ProtocolForm setOpen={setOpen} />
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <Card className="rounded-lg p-0">
        <CardContent className="flex flex-col gap-4 p-4">
          <InputSearchBox />
          <DataTable
            columns={columns}
            data={filteredProtocols as TProtocolDetails[]}
            pagination={{}}
            showPagination={false}
            isLoading={isLoading}
            isRefetching={isRefetching}
            onRowClick={(row) => {
              const { name } = row;

              if (name) {
                navigate({
                  to: "/protocols/$slug",
                  params: { slug: name },
                });
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
