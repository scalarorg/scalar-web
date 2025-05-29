import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PropsWithChildren } from 'react';
import { useFormContext } from 'react-hook-form';
import { TFaucetForm } from '../schemas';

type Props = PropsWithChildren<{
  isPending?: boolean;
}>;

export const FaucetFormLayout = ({ children, isPending = false }: Props) => {
  const form = useFormContext<TFaucetForm>();

  const { control } = form;

  return (
    <div className='space-y-7.5'>
      <div className='space-y-5'>
        <div className='space-y-6'>
          <FormField
            control={control}
            name='address'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-semibold text-base'>Enter your address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Enter your address' className='h-10 border shadow-none' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            disabled={isPending}
            className='h-10 w-full gap-2 font-normal text-lg'
            isLoading={isPending}
          >
            Get Testnet Tokens
          </Button>
        </div>
        <p className='mx-auto max-w-99 text-center text-secondary-500'>
          Testnet tokens are for development purposes only, they do not have real value.
        </p>
      </div>
      {children}
    </div>
  );
};
