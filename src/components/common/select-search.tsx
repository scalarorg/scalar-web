import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, fuzzyMatch } from '@/lib/utils';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { If } from './if';

export type TSelectSearchOptionItem = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  hideValue?: string;
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
  searchByHideValue?: boolean;
  showGroupLabelOfValue?: boolean;
};

// Type Guard
const isGroup = (option: TSelectSearchOption): option is TSelectSearchGroup => {
  return (option as TSelectSearchGroup).items !== undefined;
};

const SPECIAL_CHARACTER = '--';

export const SelectSearch = ({
  value,
  onChange,
  emptyFoundDataText = 'No data found',
  placeholder = 'Select',
  disabled = false,
  searchPlaceholder = 'Search',
  options,
  classNames,
  searchByHideValue = false,
  showGroupLabelOfValue = false
}: TSelectSearchProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const hasGroupLabel = options.some((option) => isGroup(option));

  const returnNewValue = (value: string, hideValue = '') =>
    searchByHideValue ? `${value}${SPECIAL_CHARACTER}${hideValue}` : value;

  const handleChange = (value: string) => {
    const [newValue] = value.split(SPECIAL_CHARACTER);
    onChange(newValue);
    setOpen(false);
  };
  type TSelectItemWithOptionalGroup = TSelectSearchOptionItem & { groupLabel?: ReactNode };

  const flatItemWithGroup: TSelectItemWithOptionalGroup[] = options.flatMap((option) => {
    if (isGroup(option)) {
      return option.items.map((item) => ({
        ...item,
        groupLabel: option.groupLabel
      }));
    }
    return [{ ...option }];
  });

  const selectedItem = flatItemWithGroup.find((item) => item.value === value);

  return (
    <div className={cn('*:not-first:mt-2', classNames?.wrapper)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            aria-expanded={open}
            className={cn(
              'cursor-pointer w-full flex justify-between border-none bg-white hover:bg-white px-3 font-normal main-shadow outline-none',
              classNames?.button
            )}
            disabled={disabled}
          >
            <span className={cn('truncate text-base', !value && 'text-muted-foreground')}>
              <If condition={!!selectedItem}>
                <If condition={showGroupLabelOfValue && selectedItem?.groupLabel}>
                  <div className='flex items-center text-start'>
                    <span className='text-muted-foreground text-xs'>{selectedItem?.groupLabel}</span>
                    <span className='mx-1'>/</span>
                    <span>{selectedItem?.label}</span>
                  </div>
                </If>
                <If condition={!showGroupLabelOfValue || !selectedItem?.groupLabel}>{selectedItem?.label}</If>
              </If>
              <If condition={!selectedItem}>{placeholder}</If>
            </span>
            <ChevronDownIcon size={16} className='shrink-0 text-muted-foreground/80' aria-hidden='true' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='main-shadow w-full min-w-[var(--radix-popper-anchor-width)] border-none p-0'
          align='start'
        >
          <Command
            filter={(value, search) => {
              const newValue = searchByHideValue ? value.split(SPECIAL_CHARACTER)[1] : value;
              return fuzzyMatch(newValue || '', search) ? 1 : 0;
            }}
          >
            <CommandInput
              placeholder={searchPlaceholder}
              wrapperClassName={cn(
                'flex flex-row-reverse m-2 mb-0 py-1 rounded-lg border border-secondary-500 shadow-inner'
              )}
              className='h-6 text-base'
            />
            <CommandList className={classNames?.command?.list}>
              <CommandEmpty>{emptyFoundDataText}</CommandEmpty>
              <If
                condition={hasGroupLabel}
                fallback={
                  <CommandGroup className={classNames?.command?.group}>
                    {options.map(
                      (option) =>
                        !isGroup(option) && (
                          <CommandItem
                            key={option.value}
                            value={returnNewValue(option.value, option.hideValue)}
                            onSelect={handleChange}
                            className={cn('cursor-pointer', classNames?.command?.item)}
                            disabled={option.disabled}
                          >
                            {option.label}
                            <If condition={value === option.value}>
                              <CheckIcon size={16} className='ml-auto' />
                            </If>
                          </CommandItem>
                        )
                    )}
                  </CommandGroup>
                }
              >
                {options.map(
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
                            value={returnNewValue(item.value, item.hideValue)}
                            onSelect={handleChange}
                            className={cn('ml-6 cursor-pointer', classNames?.command?.item)}
                            disabled={item.disabled}
                          >
                            {item.label}
                            <If condition={value === item.value}>
                              <CheckIcon size={16} className='ml-auto' />
                            </If>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )
                )}
              </If>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
