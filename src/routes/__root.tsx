import { ConnectDropdown, ConnectScalar } from "@/components/connect";
import { Footer, Header } from "@/components/layout";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="flex h-screen flex-col">
      <Header
        extra={
          <div className="flex items-center gap-2">
            <ConnectDropdown />
            <ConnectScalar />
          </div>
        }
      />
      <hr className="shadow-md" />
      <div className="grow overflow-auto">
        <div className="container flex h-full flex-col">
          <Outlet />
          <Footer />
        </div>
      </div>
    </div>
  ),
});
