import DEFAULT_ICON from "@/assets/images/default-icon.png";
import { Clipboard, DataTable, Heading } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROTOCOL_STATUS,
  TNetworkForm,
  networkFormSchema,
} from "@/features/protocol";
import { useScalarChains, useScalarOwnProtocol } from "@/hooks";
import { addBase64Prefix, cn, isBtcChain } from "@/lib/utils";
import { useAccount, useConnectKeplr } from "@/providers/keplr-provider";
import { TProtocol } from "@/types/protocol";
import { fromBech32 } from "@cosmjs/encoding";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useForm } from "react-hook-form";

export const Route = createFileRoute("/protocols/me")({
  component: OwnProtocol,
});

const { display, accessor } = createColumnHelper<TProtocol>();

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
            className="size-8 rounded-full"
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

function OwnProtocol() {
  const { isConnected, account } = useAccount();
  const { connect } = useConnectKeplr();
  const accountAddress = account?.address
    ? Buffer.from(fromBech32(account?.address).data).toString("base64")
    : "";

  const {
    data: { protocol } = {},
    isLoading,
    isRefetching,
  } = useScalarOwnProtocol(accountAddress);

  const {
    data: { chains } = {},
  } = useScalarChains();

  const filterChains = chains?.filter((c) => !isBtcChain(c));

  const form = useForm<TNetworkForm>({
    resolver: zodResolver(networkFormSchema),
  });

  const { control } = form;

  return (
    <div className="flex flex-col gap-5 py-[60px]">
      <Heading>Your Protocol</Heading>
      {isConnected ? (
        <DataTable
          columns={columns}
          data={protocol ? [protocol] : []}
          pagination={{}}
          showPagination={false}
          isLoading={isLoading}
          isRefetching={isRefetching}
        />
      ) : (
        <Card className="p-0">
          <CardContent className="flex flex-col gap-4 p-4">
            <p className="text-lg">Connect your wallet to view your protocol</p>
            <Button className="px-5 text-lg" onClick={() => connect()}>
              Connect Scalar
            </Button>
          </CardContent>
        </Card>
      )}
      <Card className="p-0">
        <CardContent className="flex flex-col gap-4 p-4">
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <FormField
                control={control}
                name="chain"
                render={({ field: { onChange, value } }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Chain</FormLabel>
                    <Select defaultValue={value} onValueChange={onChange}>
                      <FormControl>
                        <SelectTrigger className="!text-lg">
                          <SelectValue placeholder="Select chain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filterChains?.map((name) => (
                          <SelectItem
                            key={name}
                            value={name || ""}
                            className="text-lg"
                          >
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
