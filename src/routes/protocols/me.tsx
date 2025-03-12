import DEFAULT_ICON from "@/assets/images/default-icon.png";
import {
  Clipboard,
  DataTable,
  Heading,
  confirmDialogConfig,
  useConfirm,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { CreateDeployTokenParams } from "@/lib/scalar/params";
import {
  addBase64Prefix,
  cn,
  isBtcChain,
  parseKeplrError,
  shortenText,
} from "@/lib/utils";
import {
  useAccount,
  useConnectKeplr,
  useKeplrClient,
} from "@/providers/keplr-provider";
import { TProtocol } from "@/types/protocol";
import { fromBech32 } from "@cosmjs/encoding";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { isEmpty } from "lodash";
import { ArrowLeftIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
              textClassName="w-[150px]"
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
              "mx-auto flex w-fit items-center justify-center rounded-full px-4 py-1 text-base text-white",
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
  const [formLoading, setFormLoading] = useState(false);

  const accountAddress = account?.address
    ? Buffer.from(fromBech32(account?.address).data).toString("base64")
    : "";

  const { data: scalarClient, isLoading: isScalarClientLoading } =
    useKeplrClient();

  const {
    data: { protocol } = {},
    isLoading,
    isRefetching,
  } = useScalarOwnProtocol(accountAddress);

  const queryClient = useQueryClient();

  const curentNetwork = useMemo(() => {
    return protocol?.chains?.map(({ name, chain }) => name || chain);
  }, [protocol]);

  const {
    data: { chains } = {},
  } = useScalarChains();

  const filterChains = chains?.filter((c) => !isBtcChain(c));

  const form = useForm<TNetworkForm>({
    resolver: zodResolver(networkFormSchema),
  });

  const { control, handleSubmit, reset, watch } = form;

  const confirm = useConfirm();

  const onSubmit = handleSubmit(async (values: TNetworkForm) => {
    if (isScalarClientLoading || !scalarClient || !account) return;

    setFormLoading(true);
    try {
      const { chain, alias: aliased_token_name } = values;
      const newValues: CreateDeployTokenParams = {
        chain,
        token_symbol: protocol?.asset?.symbol,
        aliased_token_name,
      };

      const result = await scalarClient.raw.createDeployToken(
        account.address,
        newValues,
        "auto",
        "",
      );

      const txHash = result.transactionHash;

      queryClient.invalidateQueries({
        queryKey: ["get", "/scalar/protocol/v1beta1/protocol"],
      });
      reset();

      toast.success(
        <p className="w-fit">
          Token created successfully!
          <a
            //TODO: replace with explorer url
            href={`https://explorer.scalarorg.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {" "}
            {shortenText(txHash, 8)}
          </a>
        </p>,
      );
    } catch (error) {
      const parsedError = parseKeplrError((error as Error).message || "");

      if (parsedError) {
        const { detail } = parsedError;
        const desc = typeof detail === "string" ? detail : detail[0].desc;
        const [needMessage] = desc.split(":");

        if (needMessage) {
          toast.error(needMessage);
        }
      }

      console.error(error);
    } finally {
      setFormLoading(false);
    }
  });

  const handleConfirm = async () => {
    const isConfirmed = await confirm({
      ...confirmDialogConfig.warning,
      title: "Network Selection Confirmation",
      description: (
        <div className="flex flex-col gap-2">
          <p className="text-center">
            Once you choose a network for this protocol and save your selection,
            it will be <span className="font-semibold">permanent</span>. You
            won’t be able to remove or change it later.
          </p>
          <p className="text-center text-border">
            Please double-check your choice before proceeding.
          </p>
        </div>
      ),
    });

    if (isConfirmed) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-5 py-[60px]">
      <div className="flex items-center gap-3">
        <Link to="/protocols">
          <ArrowLeftIcon size={24} />
        </Link>
        <Heading>Your Protocol</Heading>
      </div>
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
        <Card className="rounded-lg p-0">
          <CardContent className="flex flex-col gap-4 p-4">
            <p className="text-base text-text-primary-500">
              Connect your wallet to view your protocol
            </p>
            <Button size="lg" onClick={() => connect()}>
              Connect Scalar
            </Button>
          </CardContent>
        </Card>
      )}
      {isConnected && !isEmpty(protocol) && (
        <Card className="p-0">
          <CardContent className="flex flex-col gap-4 p-4">
            <p className="text-base">
              Protocol{" "}
              <span className="font-semibold text-primary">
                {protocol?.name}
              </span>{" "}
              is currently on Network.
              <span>{curentNetwork?.join(", ")}</span>
            </p>
            <div className="flex gap-5">
              <p className="text-base leading-[36px]">
                Select a network to add for the selected protocol.
              </p>
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                  className="space-y-3"
                >
                  <FormField
                    control={control}
                    name="chain"
                    render={({ field: { onChange, value } }) => (
                      <FormItem className="flex-1">
                        <Select defaultValue={value} onValueChange={onChange}>
                          <FormControl>
                            <SelectTrigger className="!text-base min-w-[190px] rounded-full border-transparent bg-[#EDF1FF] px-5">
                              <SelectValue placeholder="Select Network" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filterChains?.map((name) => (
                              <SelectItem
                                key={name}
                                value={name || ""}
                                className="text-base"
                                disabled={curentNetwork?.includes(name)}
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
                  <FormField
                    control={control}
                    name="alias"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Please enter the alias"
                            className="!text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    className="w-full text-base"
                    onClick={handleConfirm}
                    disabled={!(watch("chain") && watch("alias"))}
                    isLoading={formLoading || isScalarClientLoading}
                  >
                    Save
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
