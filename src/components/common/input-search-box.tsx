import { IconInput, TIconInput } from '@/components/ui/input';
import { usePathname } from '@/hooks';
import { cn } from '@/lib/utils';
import { useRouter } from '@tanstack/react-router';
import { SearchIcon } from 'lucide-react';
import { ChangeEvent, useCallback, useDeferredValue, useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

type Props = {
  keyword?: string;
} & Omit<TIconInput, 'onChange' | 'value'>;
export const InputSearchBox = ({ keyword, className, ...props }: Props) => {
  const { navigate } = useRouter();
  const pathname = usePathname();
  const [valueSearch, setValueSearch] = useState(keyword);
  const debouncedValueSearch = useDeferredValue(valueSearch);

  const onSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValueSearch(value);
  }, []);

  const debounceNavigate = useDebounceCallback(
    (keyword: string | undefined) =>
      navigate({
        to: pathname,
        search: (prev) => ({
          ...prev,
          q: keyword || undefined
        })
      }),
    300
  );

  useEffect(() => {
    if (valueSearch !== keyword) {
      debounceNavigate(valueSearch);
    }

    // Cleanup debounce when component unmounts
    return debounceNavigate.cancel;
  }, [debounceNavigate, valueSearch, keyword]);

  return (
    <IconInput
      startIcon={<SearchIcon className='size-5' />}
      placeholder='Search'
      {...props}
      className={cn('!text-base !rounded-lg h-10 border-none pl-10', className)}
      wrapperClassName='main-card-shadow rounded-lg'
      iconClassName='size-10'
      onChange={onSearch}
      value={debouncedValueSearch}
    />
  );
};
