import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BridgeForm } from "@/features/bridge";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex h-screen justify-center gap-2 p-5">
      <Tabs defaultValue="bridge" className="min-w-[500px] max-w-[800px]">
        <TabsList className="w-full">
          <TabsTrigger value="bridge">Bridge</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="redeem">Redeem</TabsTrigger>
        </TabsList>
        <TabsContent value="bridge">
          <BridgeForm />
        </TabsContent>
        <TabsContent value="transfers">Transfers</TabsContent>
        <TabsContent value="redeem">Redeem</TabsContent>
      </Tabs>
    </div>
  );
}
