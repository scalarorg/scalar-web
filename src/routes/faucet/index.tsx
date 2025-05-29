import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  ConnectInfo,
  FaucetFormLayout,
  TFaucetForm,
  faucetFormSchema,
} from "@/features/faucet";
import { faucetQuery } from "@/features/faucet";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { SubmitHandler } from "node_modules/react-hook-form/dist/types";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const Route = createFileRoute("/faucet/")({
  component: FaucetPage,
});

function FaucetPage() {
  const { mutate, isPending } = faucetQuery.mutate.useCreatFaucet();

  const defaultValues: TFaucetForm = {
    address: "",
  };

  const form = useForm<TFaucetForm>({
    resolver: zodResolver(faucetFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = form;

  const onSubmit: SubmitHandler<TFaucetForm> = (data) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Faucet request sent");
        reset(defaultValues);
      },
    });
  };

  return (
    <div className="flex flex-col gap-5 py-15">
      <Card className="mx-auto max-w-150">
        <CardHeader>
          <CardTitle className="text-center font-semibold text-2xl">
            Faucet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FaucetFormLayout isPending={isPending}>
                <ConnectInfo />
              </FaucetFormLayout>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
