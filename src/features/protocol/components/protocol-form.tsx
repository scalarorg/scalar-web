import DEFAULT_ICON from "@/assets/images/default-icon.png";
import { ImageCropper } from "@/components/common";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScalarChains, useScalarCustodianGroups } from "@/hooks";
import {
  CreateProtocolParams,
  LiquidityModelParams,
} from "@/lib/scalar/interface";
import {
  cn,
  extractBase64Data,
  isBtcChain,
  parseKeplrError,
  shortenText,
} from "@/lib/utils";
import { convertToBytes } from "@/lib/wallet";
import { useAccount, useKeplrClient } from "@/providers/keplr-provider";
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
          "[&_label[data-slot=form-label]]:text-[22px]",

          // Styling for input elements with data-slot="form-control"
          "[&_input[data-slot=form-control]]:h-[50px]",
          "[&_button[data-slot=form-control]]:h-[50px]",
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
                    className="!text-lg"
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
                    className="size-[100px] cursor-pointer ring-2 ring-slate-200 ring-offset-2"
                  >
                    <input {...getInputProps()} />
                    <AvatarImage src={DEFAULT_ICON} alt="icon" />
                    <AvatarFallback>Icon</AvatarFallback>
                  </Avatar>
                )}
                <FormDescription>
                  File smaller than {MAX_FILE_SIZE}MB
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormItem>
          <FormLabel>Token</FormLabel>
          <div className="flex flex-col gap-5">
            <div className="flex gap-5">
              <FormField
                control={control}
                name="token_name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Name"
                        className="!text-lg"
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
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Decimals"
                        className="!text-lg"
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
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Capacity"
                        className="!text-lg"
                        onChange={(event) =>
                          field.onChange(+event.target.value || undefined)
                        }
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
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Symbol"
                        className="!text-lg"
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
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Daily mint limit"
                        className="!text-lg"
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
                  className="!text-lg"
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
                <Select defaultValue={value} onValueChange={onChange}>
                  <FormControl>
                    <SelectTrigger className="!text-lg w-[200px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LIQUIDITY_MODEL.LIST.map(({ label, value }) => (
                      <SelectItem key={value} value={value} className="text-lg">
                        {label}
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
            name="custodian_group_uid"
            render={({ field: { onChange, value } }) => (
              <FormItem className="grow">
                <FormLabel>Custodian group</FormLabel>
                <Select defaultValue={value} onValueChange={onChange}>
                  <FormControl>
                    <SelectTrigger className="!text-lg">
                      <SelectValue placeholder="Select custodian group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groups?.map(({ uid, name }) => (
                      <SelectItem
                        key={uid}
                        value={uid || ""}
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
        </div>
        <div className="flex items-start gap-5">
          <FormField
            control={control}
            name="chain_name"
            render={({ field: { onChange, value } }) => (
              <FormItem className="flex-1">
                <FormLabel>Chain name</FormLabel>
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
          <FormField
            control={control}
            name="tag"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Tag</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Tag" className="!text-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="sticky bottom-0 bg-white">
          <Button
            type="submit"
            className="h-[50px] w-full text-lg"
            isLoading={formLoading}
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};
