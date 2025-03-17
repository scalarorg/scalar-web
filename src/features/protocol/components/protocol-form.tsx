import DEFAULT_ICON from "@/assets/images/default-icon.png";
import { ChainIcon, ImageCropper, SelectSearch } from "@/components/common";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useScalarChains, useScalarCustodianGroups } from "@/hooks";
import { Chains } from "@/lib/chains";
import {
  CreateProtocolParams,
  LiquidityModelParams,
} from "@/lib/scalar/params";
import {
  cn,
  extractBase64Data,
  isBtcChain,
  parseKeplrError,
  shortenText,
} from "@/lib/utils";
import { convertToBytes } from "@/lib/wallet";
import { useAccount, useKeplrClient } from "@/providers/keplr-provider";
import { SupportedChains } from "@/types/chains";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LIQUIDITY_MODEL, MAX_FILE_SIZE } from "../constans";
import { TProtocolForm, protocolFormSchema } from "../schemas";

type Props = {
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const ProtocolForm = ({ setOpen }: Props) => {
  const [formLoading, setFormLoading] = useState(false);
  const {
    data: { groups } = {},
  } = useScalarCustodianGroups();
  const {
    data: { chains } = {},
  } = useScalarChains();
  const { data: scalarClient, isLoading: isScalarClientLoading } =
    useKeplrClient();

  const { account } = useAccount();

  const queryClient = useQueryClient();

  const filterChains = chains?.filter((c) => isBtcChain(c));

  const form = useForm<TProtocolForm>({
    resolver: zodResolver(protocolFormSchema),
    defaultValues: {
      model: "LIQUIDITY_MODEL_POOL",
      token_decimals: 8,
      token_daily_mint_limit: "0",
      token_capacity: "0",
    },
  });

  const { control, setValue, handleSubmit } = form;

  const [openCropper, setOpenCropper] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const file = acceptedFiles[0];
      const fileSize = file.size;

      if (fileSize > convertToBytes(MAX_FILE_SIZE, "MB")) {
        toast.error("Selected image is too large!");
        return;
      }

      const preview = URL.createObjectURL(file);
      setValue("avatar", preview);
      setOpenCropper(true);
    },
    [setValue],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  const onSubmit = async (values: TProtocolForm) => {
    if (isScalarClientLoading || !scalarClient || !account) return;

    setFormLoading(true);
    try {
      const { model, chain_name, avatar, symbol, ...rest } = values;
      const newValues: CreateProtocolParams = {
        ...rest,
        attributes: {
          model: model as LiquidityModelParams,
        },
        asset: {
          chain: chain_name,
          symbol,
        },
        avatar: extractBase64Data(avatar),
      };

      const result = await scalarClient.raw.createProtocol(
        account.address,
        newValues,
        "auto",
        "",
      );

      const txHash = result.transactionHash;

      queryClient.invalidateQueries({
        queryKey: ["get", "/scalar/protocol/v1beta1"],
      });

      toast.success(
        <p className="w-fit">
          Protocol created successfully!
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

      setOpen(false);
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
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          // Layout
          "max-h-[500px] space-y-5 overflow-y-auto px-1",

          // Position & Margin
          "relative mt-5",

          // Styling for label elements with data-slot="form-label"
          "[&_label[data-slot=form-label]]:text-base",

          // Styling for input elements with data-slot="form-control"
          "[&_input[data-slot=form-control]]:h-10",
          "[&_button[data-slot=form-control]]:h-10",
        )}
      >
        <div className="flex items-center gap-5">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Protocol name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Protocol name"
                    className="!text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="avatar"
            render={({ field: { value, onChange } }) => (
              <FormItem className="p-4">
                {value ? (
                  <ImageCropper
                    dialogOpen={openCropper}
                    setDialogOpen={setOpenCropper}
                    imageUrl={value}
                    onCropComplete={onChange}
                    onCancel={() => onChange("")}
                  />
                ) : (
                  <Avatar
                    {...getRootProps()}
                    className="mx-auto size-[100px] cursor-pointer ring-2 ring-slate-200 ring-offset-2"
                  >
                    <input {...getInputProps()} />
                    <AvatarImage src={DEFAULT_ICON} alt="icon" />
                    <AvatarFallback>Icon</AvatarFallback>
                  </Avatar>
                )}
                <FormDescription className="text-base">
                  File smaller than {MAX_FILE_SIZE}MB
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormItem>
          <div className="flex flex-col gap-5">
            <div className="flex gap-5">
              <FormField
                control={control}
                name="token_name"
                render={({ field }) => (
                  <FormItem className="h-fit flex-1">
                    <FormLabel>Token</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Name"
                        className="!text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="token_decimals"
                render={({ field }) => (
                  <FormItem className="h-fit flex-1">
                    <FormLabel>Decimals</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Decimals"
                        className="!text-base"
                        onChange={(event) =>
                          field.onChange(+event.target.value || undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-5">
              <FormField
                control={control}
                name="token_capacity"
                render={({ field }) => (
                  <FormItem className="h-fit flex-1">
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Capacity"
                        className="!text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="symbol"
                render={({ field }) => (
                  <FormItem className="h-fit flex-1">
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Symbol"
                        className="!text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="token_daily_mint_limit"
                render={({ field }) => (
                  <FormItem className="h-fit flex-1">
                    <FormLabel>Daily mint limit</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Daily mint limit"
                        className="!text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </FormItem>
        <FormField
          control={control}
          name="bitcoin_pubkey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bitcoin pubkey</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Bitcoin pubkey"
                  className="!text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-start gap-5">
          <FormField
            control={control}
            name="model"
            render={({ field: { onChange, value } }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <SelectSearch
                  value={value}
                  onChange={onChange}
                  options={LIQUIDITY_MODEL.LIST}
                  classNames={{ wrapper: "w-[200px]" }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="custodian_group_uid"
            render={({ field: { onChange, value } }) => (
              <FormItem className="grow">
                <FormLabel>Custodian group</FormLabel>
                <SelectSearch
                  value={value}
                  onChange={onChange}
                  placeholder="Select custodian group"
                  searchByHideValue
                  options={
                    groups?.map(({ uid = "", name = "" }) => ({
                      value: uid,
                      label: name,
                      hideValue: name,
                    })) || []
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-start gap-5">
          <FormField
            control={control}
            name="chain_name"
            render={({ field: { onChange, value } }) => (
              <FormItem className="flex-1">
                <FormLabel>Chain name</FormLabel>
                <SelectSearch
                  value={value}
                  onChange={onChange}
                  placeholder="Select chain"
                  searchByHideValue
                  options={
                    filterChains?.map((name = "") => ({
                      value: name,
                      label: (
                        <ChainIcon chain={name as SupportedChains} showName />
                      ),
                      hideValue: name || Chains[name as SupportedChains]?.name,
                    })) || []
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="tag"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Tag</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Tag" className="!text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="sticky bottom-0 bg-white">
          <Button
            type="submit"
            className="w-full"
            isLoading={formLoading}
            size="lg"
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};
