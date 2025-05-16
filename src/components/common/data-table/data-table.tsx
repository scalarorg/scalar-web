import { COMMON_DEFAULT_PAGE_SIZE } from "@/constants";
import {
  ColumnDef,
  PaginationState,
  TableOptions,
  type Table as TableType,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { range, size } from "lodash";
import {
  ReactNode,
  Ref,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePaginationTable, useSortingTable } from "@/hooks";
import { cn } from "@/lib/utils";
import { Spin } from "../spin";
import { TablePagination } from "./table-pagination";
type TableClassNames = Partial<{
  body: string;
  cell: string;
  container: string;
  emptyCell: string;
  emptyRow: string;
  footer: string;
  footerRow: string;
  header: string;
  headerCell: string;
  headerRow: string;
  pagination: string;
  root: string;
  row: string;
  table: string;
  tableWrapper: string;
  toolbar: Partial<{
    wrapper: string;
    search: string;
  }>;
  wrapper: string;
}>;

type DataTableProps<TData> = Pick<
  TableOptions<TData>,
  | "pageCount"
  | "enableRowSelection"
  | "onRowSelectionChange"
  | "state"
  | "getRowId"
> & {
  data: TData[] | undefined;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  columns: ColumnDef<TData, any>[];
  classNames?: TableClassNames;
  pagination: Partial<PaginationState>;
  endToolbar?: ReactNode;
  searchLabel?: string;
  isLoading?: boolean;
  isRefetching?: boolean;
  pageSizeOptions?: number[];
  onRowClick?: (row: TData) => void;

  extraTableToolbar?: ReactNode;
  isSimple?: boolean;
  showPagination?: boolean;
};

/**
 * DataTable component with pagination and sorting, managed by URL parameters.
 * @param props - The props to configure the DataTable.
 * @param ref - Forwarded ref for accessing the table instance.
 */
const DataTableInnerForwardRef = <TData,>(
  {
    data = [],
    columns,
    classNames = {},
    pagination: { pageIndex = 1, pageSize = COMMON_DEFAULT_PAGE_SIZE },
    isLoading = false,
    isRefetching = false,
    extraTableToolbar,
    onRowClick,
    state,
    pageSizeOptions,
    isSimple = false,
    showPagination = true,
    ...props
  }: DataTableProps<TData>,
  ref?: Ref<{
    table: TableType<TData>;
  }>,
) => {
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(true);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const pagination = {
    pageIndex: pageIndex - 1,
    pageSize: pageSize,
  };

  const { sorting, onSortingChange } = useSortingTable();
  const { onPaginationChange } = usePaginationTable({
    pagination,
  });

  const table = useReactTable({
    data,
    columns,
    manualSorting: true,
    manualPagination: true,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange,

    state: {
      ...state,
      sorting,
      pagination,
    },
    ...props,
  });

  useImperativeHandle(
    ref,
    () => ({
      table,
    }),
    [table],
  );

  useEffect(() => {
    if (isLoading) return;

    const tableWrapper = tableWrapperRef.current;
    if (!tableWrapper) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = tableWrapper;

      setShowLeftShadow(scrollLeft > 0);
      setShowRightShadow(
        scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth,
      );
    };

    tableWrapper.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    handleScroll();

    return () => {
      tableWrapper.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isLoading]);

  const numberOfColumns = table.getAllColumns().length;

  return (
    <div
      className={cn(
        "flex h-full grow flex-col overflow-hidden",
        classNames.root,
      )}
    >
      {extraTableToolbar && (
        <div
          className={cn(
            "flex items-center justify-between",
            classNames.toolbar?.wrapper,
          )}
        >
          {extraTableToolbar}
        </div>
      )}
      <div
        className={cn("flex grow flex-col overflow-auto", classNames.container)}
      >
        <Spin
          loading={isRefetching}
          className={cn(
            // Layout
            "!flex relative grow flex-col",

            // Overflow
            "overflow-hidden",

            // Styling
            "rounded-lg border border-gray-200",

            // Shadow effects
            showLeftShadow && "table-left-shadow",
            showRightShadow && "table-right-shadow",
          )}
        >
          <div
            ref={tableWrapperRef}
            className={cn(
              // Positioning
              "relative",

              // Sizing
              "size-full",

              // Overflow
              "overflow-auto",

              classNames.tableWrapper,
            )}
          >
            <Table
              className={cn(
                classNames.table,
                table.getRowModel().rows?.length === 0 && "h-full",
              )}
            >
              <TableHeader
                className={cn(
                  // Positioning
                  "sticky top-0 z-20",

                  // Layout
                  "whitespace-nowrap",

                  // Background
                  "bg-white [&_tr]:bg-white",

                  // Effects
                  "shadow-sm",
                  classNames.header,
                )}
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className={cn(
                      "w-fit divide-x divide-neutral-50",
                      classNames.headerRow,
                    )}
                  >
                    {headerGroup.headers.map((header) => {
                      const { meta } = header.column.columnDef;

                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "w-fit whitespace-nowrap bg-neutral-gray px-5",
                            "font-semibold text-text-primary-500",
                            classNames.headerCell,
                            meta?.className,
                            meta?.header?.className,
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className={cn("overflow-auto", classNames.body)}>
                {isLoading ? (
                  range(table.getState().pagination.pageSize).map((i) => (
                    <TableRow key={i} className="divide-x divide-neutral-50">
                      {range(numberOfColumns).map((i) => (
                        <TableCell key={i} className="h-12">
                          <Skeleton className="size-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        index % 2 === 0 && "bg-white",
                        classNames.row,
                        onRowClick && "cursor-pointer",
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const { meta } = cell.column.columnDef;

                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "px-5",
                              meta?.className,
                              meta?.cell?.className,
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="h-full">
                    <TableCell colSpan={columns.length}>
                      <div className="flex items-center justify-center py-8">
                        <p className="font-semibold">No data</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Spin>
      </div>
      {showPagination && (
        <TablePagination
          className={cn(classNames.pagination, size(data) === 0 && "invisible")}
          table={table}
          isLoading={isLoading}
          pageSizeOptions={pageSizeOptions}
          // isSimple={isSimple}
        />
      )}
    </div>
  );
};

const DataTable = forwardRef(DataTableInnerForwardRef) as <TData>(
  props: DataTableProps<TData> & {
    ref?: Ref<{
      table: TableType<TData>;
    }>;
  },
) => ReturnType<typeof DataTableInnerForwardRef>;

export { DataTable };
