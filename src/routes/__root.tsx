import { ConnectDropdown } from "@/components/connect";
import { Footer, Header } from "@/components/layout";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="flex h-screen flex-col">
      <Header extra={<ConnectDropdown />} />
      <hr className="shadow-md" />
      <div className="grow overflow-auto">
        <div className="container">
          <Outlet />
          <Footer />
        </div>
      </div>
    </div>
  ),
});
