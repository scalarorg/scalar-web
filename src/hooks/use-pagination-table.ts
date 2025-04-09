import { useRouter } from "@tanstack/react-router";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useCallback, useTransition } from "react";

export function usePaginationTable({
  pagination,
}: {
  pagination: PaginationState;
}) {
  const router = useRouter();
  const { state, navigate } = router;
  const { pathname } = state.location;
  const [isPending, startTransition] = useTransition();

  const onPaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updaterOrValue) => {
      if (typeof updaterOrValue === "function") {
        const { pageSize, pageIndex } = updaterOrValue(pagination);

        startTransition(() => {
          navigate({
            to: pathname,
            search: (prev) => ({
              ...prev,
              offset: pageIndex,
              size: pageSize,
            }),
          });
        });
      }
    },
    [navigate, pagination, pathname],
  );

  return {
    isPending,
    onPaginationChange,
  };
}
