import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { ReactNode, useState } from "react";

export type TSelectSearchOptionItem = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export type TSelectSearchGroup = {
  groupLabel: ReactNode;
  key: string;
  items: TSelectSearchOptionItem[];
};

export type TSelectSearchOption = TSelectSearchOptionItem | TSelectSearchGroup;
export type TSelectSearchProps = {
  value: string;
  onChange: (value: string) => void;
  emptyFoundDataText?: string;
  placeholder?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  options: TSelectSearchOption[];
  classNames?: Partial<{
    wrapper: string;
    button: string;
    command: Partial<{
      group: string;
      list: string;
      item: string;
    }>;
  }>;
};

// Type Guard
const isGroup = (option: TSelectSearchOption): option is TSelectSearchGroup => {
  return (option as TSelectSearchGroup).items !== undefined;
};

export const SelectSearch = ({
  value,
  onChange,
  emptyFoundDataText = "No data found",
  placeholder = "Select",
  disabled = false,
  searchPlaceholder = "Search",
  options,
  classNames,
}: TSelectSearchProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const hasGroupLabel = options.some((option) => isGroup(option));

  return (
    <div className={cn("*:not-first:mt-2", classNames?.wrapper)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-expanded={open}
            className={cn(
              // Cursor
              "cursor-pointer",

              // Width
              "w-full",

              // Flexbox Alignment
              "flex justify-between",

              // Borders
              "border-none",

              // Background Color
              "bg-white hover:bg-white",

              // Padding
              "px-3",

              // Font Weight
              "font-normal",

              // Box Shadow
              "shadow-[0px_1px_2px_0px_#00000040]",

              // Outline
              "outline-none",

              classNames?.button,
            )}
            disabled={disabled}
          >
            <span
              className={cn(
                "truncate text-base",
                !value && "text-muted-foreground",
              )}
            >
              {options
                .flatMap((option) => (isGroup(option) ? option.items : option))
                .find((item) => item.value === value)?.label || placeholder}
            </span>
            <ChevronDownIcon
              size={16}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-[var(--radix-popper-anchor-width)] border-none p-0 shadow-[0px_1px_2px_0px_#00000040]"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              wrapperClassName="flex-row-reverse m-2 mb-0 py-1 border border-secondary-500 rounded-lg shadow-[0px_1px_2px_0px_#00000040_inset]"
              className="h-6 text-base"
            />
            <CommandList className={classNames?.command?.list}>
              <CommandEmpty>{emptyFoundDataText}</CommandEmpty>
              {hasGroupLabel ? (
                options.map(
                  (option) =>
                    isGroup(option) && (
                      <CommandGroup
                        heading={option.groupLabel}
                        key={option.key}
                        className={classNames?.command?.group}
                      >
                        {option.items.map((item) => (
                          <CommandItem
                            key={item.value}
                            value={item.value}
                            onSelect={(currentValue) => {
                              onChange(currentValue);
                              setOpen(false);
                            }}
                            className={cn(
                              "ml-6 cursor-pointer",
                              classNames?.command?.item,
                            )}
                            disabled={item.disabled}
                          >
                            {item.label}
                            {value === item.value && (
                              <CheckIcon size={16} className="ml-auto" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ),
                )
              ) : (
                <CommandGroup className={classNames?.command?.group}>
                  {options.map(
                    (option) =>
                      !isGroup(option) && (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={(currentValue) => {
                            onChange(currentValue);
                            setOpen(false);
                          }}
                          className={cn(
                            "cursor-pointer",
                            classNames?.command?.item,
                          )}
                          disabled={option.disabled}
                        >
                          {option.label}
                          {value === option.value && (
                            <CheckIcon size={16} className="ml-auto" />
                          )}
                        </CommandItem>
                      ),
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
