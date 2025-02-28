import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type Table as TableType } from "@tanstack/react-table";
import { range } from "lodash";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

type TablePaginationProps<TData> = {
  className?: string;
  table: TableType<TData>;
  isLoading?: boolean;
  pageSizeOptions?: number[];
  isSimple?: boolean;
};

const PAGE_SIZE_OPTIONS = [50, 75, 100];

export function TablePagination<TData>({
  table,
  className,
  isLoading = false,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  isSimple = false,
}: TablePaginationProps<TData>) {
  const {
    getCanPreviousPage,
    setPageIndex,
    previousPage,
    getState,
    getPageCount,
    getCanNextPage,
    nextPage,
    setPagination,
  } = table;

  const page = getState().pagination.pageIndex + 1;
  const pageCount = getPageCount();

  const items = generatePages(page, pageCount, 1);

  return (
    <div
      className={cn(
        // Background
        "bg-white",

        // Layout
        "flex flex-wrap items-center",

        // Spacing
        "gap-4 py-4 md:px-2",
        className,
      )}
    >
      {isLoading ? (
        <PaginationSkeleton />
      ) : (
        <div className="flex w-full items-center gap-4">
          {!isSimple && (
            <div
              className={cn(
                // Positioning
                "mx-auto md:mx-0",

                // Layout
                "flex items-center",

                // Spacing
                "gap-1",

                // Text
                "text-sm md:text-base",
              )}
            >
              <span>Page</span>
              {/* <NumericFormat
                defaultValue={page}
                customInput={Input}
                allowNegative={false}
                isAllowed={({ floatValue }) =>
                  floatValue ? floatValue >= 1 && floatValue <= pageCount : true
                }
                onValueChange={({ floatValue }) => {
                  if (floatValue && floatValue !== page) {
                    setPageIndex(floatValue - 1);
                  }
                }}
                disabled={pageCount === 1}
                className="!h-9 !w-10 !text-sm md:!h-10 md:!w-[60px] md:!text-base"
              /> */}
              <Input
                type="number"
                defaultValue={page}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    setPageIndex(Number(value) - 1);
                  }
                }}
                disabled={pageCount === 1}
              />
              <span>of {pageCount}</span>
            </div>
          )}
          <div className="mx-auto flex items-center gap-2">
            <Button
              aria-label="First page"
              disabled={!getCanPreviousPage()}
              onClick={() => {
                setPageIndex(0);
              }}
              title="First page"
              variant="pagination"
              className="p-0"
              size="icon"
            >
              <ChevronsLeftIcon size={16} />
            </Button>
            <Button
              aria-label="Previous page"
              disabled={!getCanPreviousPage()}
              onClick={previousPage}
              title="Previous page"
              variant="pagination"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2 whitespace-nowrap text-sm">
              <div>
                {items.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant="pagination_link"
                    onClick={() => {
                      if (pageNumber !== "...") {
                        setPagination((old) => ({
                          ...old,
                          pageIndex: (pageNumber as number) - 1,
                        }));
                      }
                    }}
                    className={cn(
                      "rounded-full",
                      pageNumber === page && "bg-neutral-50",
                    )}
                    size="icon"
                  >
                    {pageNumber}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              aria-label="Next page"
              disabled={!getCanNextPage()}
              onClick={nextPage}
              title="Next page"
              variant="pagination"
            >
              Next
            </Button>
            <Button
              aria-label="Last page"
              disabled={!getCanNextPage()}
              onClick={() => setPageIndex(pageCount)}
              title="Last page"
              variant="pagination"
              className="p-0"
              size="icon"
            >
              <ChevronsRightIcon size={16} />
            </Button>
          </div>
          {!isSimple && (
            <div className="flex items-center gap-1 text-sm md:text-base">
              <span>Show</span>
              <Select
                value={`${getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-10 w-[72px] text-sm md:text-base">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>entries</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const generatePages = (current: number, total: number, siblings: number) => {
  const totalNumbers = siblings * 2 + 3;
  const totalBlocks = totalNumbers + 2;

  if (total <= totalBlocks) {
    return range(1, total + 1);
  }

  const startPage = Math.max(current - siblings, 1);
  const endPage = Math.min(current + siblings, total);

  const hasLeftEllipsis = startPage > 2;
  const hasRightEllipsis = endPage < total - 1;

  const pages: (number | string)[] = [];

  if (hasLeftEllipsis) {
    pages.push(1, "...");
  } else {
    pages.push(...range(1, startPage));
  }

  pages.push(...range(startPage, endPage + 1));

  if (hasRightEllipsis) {
    pages.push("...", total);
  } else {
    pages.push(...range(endPage + 1, total + 1));
  }

  return pages;
};

// Skeleton Components
const PageSkeleton = () => (
  <Skeleton className="size-9 rounded-full md:h-10 md:w-[200px]" />
);

const ButtonSkeleton = () => (
  <Skeleton
    className={cn(
      // Sizing
      "size-9 md:h-10 md:w-[100px]",

      // Shape
      "rounded-lg md:rounded-full",
    )}
  />
);

const PaginationSkeleton = () => (
  <div className="flex w-full items-center justify-between">
    <ButtonSkeleton />
    <PageSkeleton />
    <ButtonSkeleton />
  </div>
);
