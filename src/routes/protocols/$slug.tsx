import DEFAULT_ICON from "@/assets/images/default-icon.png";
import { Clipboard, Heading } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { PROTOCOL_STATUS } from "@/features/protocol";
import { useScalarProtocols } from "@/hooks";
import { addBase64Prefix } from "@/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { isEmpty } from "lodash";
import { ArrowLeftIcon } from "lucide-react";
import { ReactNode } from "react";

export const Route = createFileRoute("/protocols/$slug")({
  component: RouteComponent,
});

type TItem = {
  label: string;
  content: ReactNode;
};

const Item = ({ label, content }: TItem) => {
  return (
    <div className="flex gap-1 py-3">
      <span className="w-[180px] text-base text-secondary-500">{label}</span>
      <div className="flex-1 text-base">{content}</div>
    </div>
  );
};

function RouteComponent() {
  const { slug } = Route.useParams();

  const { data } = useScalarProtocols();

  const protocol = data?.protocols?.find((protocol) => protocol.name === slug);

  const items: TItem[] = [
    {
      label: "Name",
      content: <p className="font-semibold">{protocol?.asset?.symbol}</p>,
    },
    {
      label: "Token",
      content: (
        <div className="flex items-center gap-2">
          <img
            src={
              protocol?.avatar
                ? addBase64Prefix(protocol?.avatar)
                : DEFAULT_ICON
            }
            className="size-5 rounded-full"
            alt="avatar"
          />
          <p>{protocol?.asset?.chain}</p>
        </div>
      ),
    },
    {
      label: "Network",
      content: (
        <p>{protocol?.chains?.map((c) => c.name || c.chain).join(", ")}</p>
      ),
    },
    {
      label: "Address",
      content: (
        <div className="flex flex-col gap-1">
          {protocol?.chains
            ?.filter((c) => c.address)
            ?.map(({ address }) => (
              <Clipboard
                key={address}
                className="[&_button]:px-0"
                textClassName="w-[250px]"
                label={address}
                text={address!}
              />
            ))}
        </div>
      ),
    },
    {
      label: "Status",
      content:
        protocol?.status && PROTOCOL_STATUS.OBJECT[protocol.status]?.label,
    },
    {
      label: "Bitcoin pubkey",
      content: protocol?.bitcoin_pubkey && (
        <Clipboard
          className="[&_button]:px-0"
          textClassName="w-[250px]"
          label={protocol.bitcoin_pubkey}
          text={protocol.bitcoin_pubkey}
        />
      ),
    },
    {
      label: "Custodian group",
      content: <p>{protocol?.custodian_group?.name}</p>,
    },
  ];

  return (
    <div className="flex flex-col gap-5 py-[60px]">
      <div className="flex items-center gap-3">
        <Link to="/protocols">
          <ArrowLeftIcon size={24} />
        </Link>
        <Heading>Protocol Detail</Heading>
      </div>
      {isEmpty(protocol) ? (
        <p className="mt-5 text-center font-semibold text-3xl text-primary">
          Protocol not found
        </p>
      ) : (
        <Card className="rounded-lg p-0">
          <CardContent className="flex flex-col divide-y p-4">
            {items.map((item) => (
              <Item key={item.label} {...item} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
