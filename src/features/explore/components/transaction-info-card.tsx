import { Clipboard } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { StatusStepper } from "./status-stepper";

export type TTransactionInfoCardItem = {
  label: string;
  content: ReactNode;
};

type Props = {
  title?: ReactNode;
  items?: TTransactionInfoCardItem[];
  isSecondary?: boolean;
};

const fakeData: Props = {
  title: (
    <Clipboard
      label="jrEpaO63i40dbmBn5KYZKjA25oq1"
      text="jrEpaO63i40dbmBn5KYZKjA25oq1"
      classNames={{ wrapper: "max-w-[150px]" }}
    />
  ),
  items: [
    { label: "Type", content: <Badge>Type</Badge> },
    { label: "Status", content: <StatusStepper /> },
    { label: "Source Chain", content: "..." },
    { label: "Destination Chain", content: "..." },
    { label: "Asset", content: "..." },
    { label: "Transfer Fee", content: "..." },
    { label: "Sender", content: "..." },
    { label: "Recipient", content: "..." },
    { label: "Deposit Address", content: "..." },
    { label: "Transfer ID", content: "..." },
    { label: "Created", content: "..." },
    { label: "Time Spent", content: "..." },
  ],
};

const Item = ({ label, content }: TTransactionInfoCardItem) => {
  return (
    <div className="flex gap-1 py-3.5">
      <span className="w-[180px] font-medium text-base text-text-primary-500">
        {label}
      </span>
      <div className="flex-1 text-base">{content}</div>
    </div>
  );
};

export const TransactionInfoCard = ({
  title = fakeData.title,
  items = fakeData.items,
  isSecondary = false,
}: Props) => {
  return (
    <Card className={cn("gap-0 rounded-lg p-0", isSecondary && "bg-[#F6F8FF]")}>
      <CardHeader className="border-b px-4 py-3.5">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y px-4 py-0">
        {items!.map((item) => (
          <Item key={item.label} {...item} />
        ))}
      </CardContent>
    </Card>
  );
};
