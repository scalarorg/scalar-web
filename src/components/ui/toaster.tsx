import { If } from '../common';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './toast';
import { useToast } from './use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className='grid gap-1'>
            <If condition={title}>{(title) => <ToastTitle>{title}</ToastTitle>}</If>
            <If condition={description}>
              {(description) => <ToastDescription>{description}</ToastDescription>}
            </If>
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
