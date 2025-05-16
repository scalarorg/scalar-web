import {
  Base64Icon,
  ChainIcon,
  Clipboard,
  Heading,
  SelectSearch,
  confirmDialogConfig,
  useConfirm,
} from "@/components/common";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  PROTOCOL_STATUS,
  TNetworkForm,
  networkFormSchema,
} from "@/features/protocol";
import { useScalarChains, useScalarOwnProtocol } from "@/hooks";
import { Chains } from "@/lib/chains";
import { CreateDeployTokenParams } from "@/lib/scalar/params";
import { cn, isBtcChain, parseKeplrError, shortenText } from "@/lib/utils";
import {
  useAccount,
  useConnectKeplr,
  useKeplrClient,
} from "@/providers/keplr-provider";
import { SupportedChains } from "@/types/chains";
import { fromBech32 } from "@cosmjs/encoding";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { isArray, isEmpty } from "lodash";
import { CircleAlert } from "lucide-react";
import { Fragment, ReactNode, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const Route = createFileRoute("/protocols/me")({
  component: OwnProtocol,
});

type TColumItem = {
  title: string;
  items: ReactNode | ReactNode[];
  classNames?: Partial<{
    wrapper: string;
    title: string;
    item: string;
  }>;
};
const ColumItem = ({ title, items, classNames }: TColumItem) => {
  const newItems = isArray(items) ? items : [items];

  return (
    <div className={cn("flex flex-col gap-2", classNames?.wrapper)}>
      <p
        className={cn(
          "font-semibold text-lg text-text-primary-500",
          classNames?.title,
        )}
      >
        {title}
      </p>
      <div className={cn("flex flex-col gap-3", classNames?.item)}>
        {newItems.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Fragment key={index}>{item}</Fragment>
        ))}
      </div>
    </div>
  );
};

function OwnProtocol() {
  const { isConnected, account } = useAccount();
  const { connect } = useConnectKeplr();
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();

  const accountAddress = account?.address
    ? Buffer.from(fromBech32(account?.address).data).toString("base64")
    : "";

  const { data: scalarClient, isLoading: isScalarClientLoading } =
    useKeplrClient();

  const {
    data: { protocol } = {},
    isLoading,
  } = useScalarOwnProtocol(accountAddress);

  const protocolData: TColumItem[] = useMemo(() => {
    const address = protocol?.chains?.filter((c) => c.address);

    return isEmpty(protocol)
      ? []
      : [
        {
          title: "Protocol",
          items: (
            <div className="flex items-center gap-2">
              <Base64Icon url={protocol.avatar} className="size-6" />
              <p>{protocol?.name}</p>
            </div>
          ),
        },
        {
          title: "Token",
          items: (
            <ChainIcon
              chain={protocol?.asset?.chain as SupportedChains}
              showName
            />
          ),
        },
        {
          title: "Address",
          items: isEmpty(address) ? (
            <p>No data</p>
          ) : (
            address?.map(({ address }) => (
              <div key={address} className="max-w-[140px]">
                <Clipboard label="Copyyyyyyyyyyyyyyyy" text={address!} />
              </div>
            ))
          ),
        },
        {
          title: "Network",
          items: isEmpty(protocol?.chains) ? (
            <p>No data</p>
          ) : (
            protocol?.chains?.map((c) => (
              <ChainIcon
                key={c.chain}
                chain={c.chain as SupportedChains}
                showName
                customName={c.name}
              />
            ))
          ),
        },
        {
          title: "Status",
          items: (
            <Badge
              variant={PROTOCOL_STATUS.OBJECT[protocol?.status].variant}
              className="px-4 text-sm"
              ghost
            >
              {PROTOCOL_STATUS.OBJECT[protocol?.status].label}
            </Badge>
          ),
        },
      ];
  }, [protocol]);

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
        queryKey: ["get", "/scalar/protocol/v1beta1"],
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

      navigate({ to: "/protocols" });
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
      icon: <CircleAlert className="size-5 text-primary" />,
      title: "Network Selection Confirmation",
      description: (
        <div className="flex flex-col gap-2">
          <p>
            Once you choose a network for this protocol and save your selection,
            it will be <span className="font-semibold">permanent</span>. You
            won’t be able to remove or change it later.
          </p>
          <p className="text-secondary-500">
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
      <Heading link={{ to: "/protocols" }}>Your Protocol</Heading>
      {isConnected ? (
        isLoading ? (
          <Skeleton className="h-[100px] w-full" />
        ) : isEmpty(protocol) ? (
          <p className="mt-5 text-center font-semibold text-3xl text-primary">
            You don't have any protocol yet.
          </p>
        ) : (
          <div className="flex gap-5 rounded-lg bg-background-secondary p-5">
            {protocolData.map((item) => (
              <ColumItem
                key={item.title}
                {...item}
                classNames={{ wrapper: "flex-1" }}
              />
            ))}
          </div>
        )
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
                        <SelectSearch
                          value={value}
                          onChange={onChange}
                          placeholder="Select Network"
                          searchByHideValue
                          options={
                            filterChains?.map((name = "") => ({
                              label: (
                                <ChainIcon
                                  chain={name as SupportedChains}
                                  showName
                                />
                              ),
                              value: name,
                              disabled: curentNetwork?.includes(name),
                              hideValue: Chains[name as SupportedChains]?.name,
                            })) || []
                          }
                        />
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
