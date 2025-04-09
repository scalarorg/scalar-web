import { ESortDirection } from "@/enums";
import { useRouter } from "@tanstack/react-router";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { useCallback, useMemo, useTransition } from "react";

export function useSortingTable() {
  const router = useRouter();
  const { state, navigate } = router;
  const { pathname, search } = state.location;

  const [isPending, startTransition] = useTransition();
  const { sort, sortDirection } = search;

  const sorting = useMemo(
    (): SortingState =>
      sort
        ? [
            {
              desc: sortDirection === ESortDirection.DESC,
              id: sort,
            },
          ]
        : [],
    [sort, sortDirection],
  );

  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updaterOrValue) => {
      if (typeof updaterOrValue === "function") {
        const sorts = updaterOrValue(sorting);
        const sort = sorts.at(0);

        if (!sort) return;

        const sortId = sort.id;
        let sortDirection: ESortDirection;

        if (sortId) {
          sortDirection = sort.desc ? ESortDirection.DESC : ESortDirection.ASC;
        }

        // Use navigate to update the search params with TanStack Router
        startTransition(() => {
          navigate({
            to: pathname,
            search: { ...search, sort: sortId, sortDirection },
          });
        });
      }
    },
    [sorting, navigate, pathname, search],
  );

  return {
    sorting,
    isPending,
    onSortingChange,
  };
}
