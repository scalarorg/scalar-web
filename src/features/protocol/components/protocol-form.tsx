import DEFAULT_ICON from "@/assets/images/default-icon.png";
import { ImageCropper } from "@/components/common";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
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
import { cn, extractBase64Data, isBtcChain } from "@/lib/utils";
import { convertToBytes } from "@/lib/wallet";
import { useAccount, useKeplrClient } from "@/providers/keplr-provider";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const {
    data: { groups } = {},
  } = useScalarCustodianGroups();
  const {
    data: { chains } = {},
  } = useScalarChains();

  const { data: scalarClient, isLoading: isScalarClientLoading } =
    useKeplrClient();

  const { account } = useAccount();

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

  // TODO: add loading state

  const onSubmit = async (values: TProtocolForm) => {
    try {
      if (isScalarClientLoading || !scalarClient || !account) return;
      const newValues: CreateProtocolParams = {
        bitcoin_pubkey: values.bitcoin_pubkey,
        name: values.name,
        tag: values.tag,
        attributes: {
          model: values.model as LiquidityModelParams,
        },
        custodian_group_uid: values.custodian_group_uid,
        asset: {
          chain: values.chain_name,
          name: values.asset_name,
        },
        avatar: extractBase64Data(values.avatar),
      };

      const result = await scalarClient.raw.createProtocol(
        account.address,
        newValues,
        "auto",
        "",
      );

      const txHash = result.transactionHash;

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
            {txHash}
          </a>
        </p>,
      );

      setOpen(false);
    } catch (error) {
      console.error(error);
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
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
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
          name="asset_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Token name"
                  className="!text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={control}
          name="avatar"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <Card className="flex-row items-center gap-11 p-4">
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
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-[22px]">Icon</p>
                  <p className="text-[#C9C9C9] text-lg">
                    File smaller than {MAX_FILE_SIZE}MB
                  </p>
                </div>
              </Card>
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
        <Button
          type="submit"
          className="sticky bottom-0 h-[50px] w-full text-lg"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};
