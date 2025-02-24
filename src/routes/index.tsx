import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BridgeForm } from "@/features/bridge";
import { RedeemForm } from "@/features/redeem";
import { TransfersForm } from "@/features/transfers";
import { createFileRoute } from "@tanstack/react-router";
import { ReactNode } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

const tabs: {
  name: string;
  value: string;
  content: ReactNode;
}[] = [
  {
    name: "Bridge",
    value: "bridge",
    content: <BridgeForm />,
  },
  {
    name: "Transfers",
    value: "transfers",
    content: <TransfersForm />,
  },
  {
    name: "Redeem",
    value: "redeem",
    content: <RedeemForm />,
  },
] as const;

function Home() {
  return (
    <div className="flex justify-center gap-2 p-5">
      <Tabs
        defaultValue={tabs[0].value}
        className="min-w-[500px] max-w-[800px]"
      >
        <TabsList className="h-[60px] w-full">
          {tabs.map(({ name, value }) => (
            <TabsTrigger
              value={value}
              key={value}
              className="h-10 px-6 font-normal text-lg"
            >
              {name}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map(({ value, content }) => (
          <TabsContent key={value} value={value}>
            {content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
