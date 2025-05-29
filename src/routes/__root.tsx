import FaucetIcon from "@/assets/icons/faucet.svg";
import { ConnectDropdown, ConnectScalar } from "@/components/connect";
import { Footer, Header } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className='flex h-screen flex-col'>
      <Header
        extra={
          <div className='flex items-center gap-2'>
            <ConnectDropdown />
            <ConnectScalar />
            <Link to='/faucet'>
              <Button variant='outline' className='size-10'>
                <FaucetIcon className='!h-5 !w-auto' />
              </Button>
            </Link>
          </div>
        }
      />
      <hr className='shadow-md' />
      <div className='grow overflow-auto'>
        <div className='container flex h-full flex-col'>
          <Outlet />
          <Footer />
        </div>
      </div>
    </div>
  )
});
