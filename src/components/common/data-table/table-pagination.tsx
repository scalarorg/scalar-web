import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type Table as TableType } from "@tanstack/react-table";
import { range } from "lodash";
import { ChevronLeft, ChevronRight, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { If } from "../if";

type TablePaginationProps<TData> = {
  className?: string;
  table: TableType<TData>;
  isLoading?: boolean;
  pageSizeOptions?: number[];
};

const ELLIPSIS = "...";

export function TablePagination<TData>({ table, className, isLoading = false }: TablePaginationProps<TData>) {
  const {
    getCanPreviousPage,
    setPageIndex,
    previousPage,
    getState,
    getPageCount,
    getCanNextPage,
    nextPage,
    setPagination
  } = table;

  const page = getState().pagination.pageIndex + 1;
  const pageCount = getPageCount();

  const items = generatePages(page, pageCount, 2);

  return (
    <div
      className={cn(
        // Background
        "bg-white",

        // Layout
        "flex flex-wrap items-center",

        // Spacing
        "gap-4 py-4 md:px-2",
        className
      )}
    >
      <If condition={!isLoading} fallback={<PaginationSkeleton />}>
        <div className='flex w-full items-center gap-4'>
          <div className='mx-auto flex items-center gap-2'>
            <Button
              aria-label='First page'
              disabled={!getCanPreviousPage()}
              onClick={() => {
                setPageIndex(0);
              }}
              title='First page'
              variant='pagination'
              className='p-0'
              size='icon'
            >
              <ChevronsLeftIcon size={20} />
            </Button>
            <Button
              aria-label='Previous page'
              disabled={!getCanPreviousPage()}
              onClick={previousPage}
              title='Previous page'
              variant='pagination'
              className='p-0'
              size='icon'
            >
              <ChevronLeft size={20} />
            </Button>
            <div className='flex items-center gap-1 whitespace-nowrap text-sm'>
              {items.map((pageNumber) => (
                <Button
                  key={crypto.randomUUID()}
                  variant='pagination_link'
                  onClick={() => {
                    if (pageNumber !== ELLIPSIS) {
                      setPagination((old) => ({
                        ...old,
                        pageIndex: (pageNumber as number) - 1
                      }));
                    }
                  }}
                  className={cn(
                    "bg-hovering",
                    pageNumber === page && "bg-primary text-white hover:text-white",
                    pageNumber === ELLIPSIS && "bg-transparent"
                  )}
                  size='icon'
                  disabled={pageNumber === ELLIPSIS}
                >
                  {pageNumber}
                </Button>
              ))}
            </div>
            <Button
              aria-label='Next page'
              disabled={!getCanNextPage()}
              onClick={nextPage}
              title='Next page'
              variant='pagination'
              className='p-0'
              size='icon'
            >
              <ChevronRight size={20} />
            </Button>
            <Button
              aria-label='Last page'
              disabled={!getCanNextPage()}
              onClick={() => setPageIndex(pageCount)}
              title='Last page'
              variant='pagination'
              className='p-0'
              size='icon'
            >
              <ChevronsRightIcon size={20} />
            </Button>
          </div>
        </div>
      </If>
    </div>
  );
}

const ELLIPSES = "...";

const generatePages = (current: number, total: number, siblings: number) => {
  const totalNumbers = siblings * 2 + 3;
  const totalBlocks = totalNumbers + 2;

  if (total <= totalBlocks) {
    return range(1, total + 1);
  }

  const startPage = Math.max(current - siblings, 1);
  const endPage = Math.min(current + siblings, total);

  const hasLeftEllipsis = startPage > 3;
  const hasRightEllipsis = endPage < total - 2;

  // Use concatenation and spread operator instead of push
  const leftPages = hasLeftEllipsis ? [1, ELLIPSES] : range(1, startPage);

  const middlePages = range(startPage, endPage + 1);

  const rightPages = hasRightEllipsis ? [ELLIPSES, total] : range(endPage + 1, total + 1);

  // Combine all sections
  return [...leftPages, ...middlePages, ...rightPages];
};

// Skeleton Components
const PageSkeleton = () => <Skeleton className='size-9 rounded-full md:h-10 md:w-[200px]' />;

const PaginationSkeleton = () => (
  <div className='flex w-full items-center justify-between'>
    <PageSkeleton />
  </div>
);
