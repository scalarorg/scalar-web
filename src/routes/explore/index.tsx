import LOGO from "@/assets/images/logo.png";
import { InputSearchBox } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/")({
  component: Explore,
});

function Explore() {
  return (
    <div className="flex flex-col gap-5 py-[60px]">
      <Card className="bg-[#EDF1FF]">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-5">
            <img src={LOGO} alt="logo" className="w-[210px]" />
            <p className="text-[34px]">explorer</p>
          </div>
          <InputSearchBox
            className="bg-white"
            placeholder="Search by Txhash / Address / Block"
          />
        </CardContent>
      </Card>
    </div>
  );
}
