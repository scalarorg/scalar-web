import { RoutePath } from '@/types/routers';
import { useLocation } from '@tanstack/react-router';

export const usePathname = () => {
  const { pathname } = useLocation() as { pathname: RoutePath };
  return pathname;
};
