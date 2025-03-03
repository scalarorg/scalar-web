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
import { cn } from "@/lib/utils";
import { convertToBytes } from "@/lib/wallet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { LIQUIDITY_MODEL, MAX_FILE_SIZE } from "../constans";
import { TProtocolForm, protocolFormSchema } from "../schemas";

type Props = {
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const ProtocolForm = ({ setOpen }: Props) => {
  const form = useForm<TProtocolForm>({
    resolver: zodResolver(protocolFormSchema),
    defaultValues: {
      type: "LIQUIDITY_MODEL_POOL",
    },
  });

  const { control, setValue, handleSubmit } = form;

  const [openCropper, setOpenCropper] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const file = acceptedFiles[0];
      const fileSize = file.size;

      if (fileSize > convertToBytes(MAX_FILE_SIZE, "KB")) {
        alert("Selected image is too large!");
        return;
      }

      const preview = URL.createObjectURL(file);
      setValue("icon", preview);
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

  const onSubmit = (_values: TProtocolForm) => {
    setOpen(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          // Margin
          "mt-5",

          // Spacing between child elements
          "space-y-5",

          // Styling for label elements with data-slot="form-label"
          "[&_label[data-slot=form-label]]:text-lg",

          // Styling for input elements with data-slot="form-control"
          "[&_input[data-slot=form-control]]:h-10",
        )}
      >
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Protocol name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Protocol name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Token name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="icon"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <Card className="flex-row items-center p-4">
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
                  <p className="font-semibold text-lg">Icon</p>
                  <p className="text-[#C9C9C9]">
                    File smaller than {MAX_FILE_SIZE}KB
                  </p>
                </div>
              </Card>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-5">
          <FormField
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select defaultValue={value} onValueChange={onChange}>
                  <FormControl>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LIQUIDITY_MODEL.LIST.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
};
