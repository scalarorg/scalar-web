import {
  ComponentPropsWithRef,
  FC,
  ReactNode,
  createContext,
  memo,
  use,
  useCallback,
  useMemo,
  useState
} from "react";

import { CircleAlert, CircleCheck, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { If } from "./if";

export interface CustomActionsProps {
  confirm: () => void;
  cancel: () => void;
  config: ConfirmOptions;
  setConfig: ConfigUpdater;
}

export type ConfigUpdater = (config: ConfirmOptions | ((prev: ConfirmOptions) => ConfirmOptions)) => void;

export type LegacyCustomActions = (onConfirm: () => void, onCancel: () => void) => ReactNode;

export type EnhancedCustomActions = (props: CustomActionsProps) => ReactNode;

export interface ConfirmOptions {
  title?: ReactNode;
  description?: ReactNode;
  contentSlot?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  icon?: ReactNode;
  customActions?: LegacyCustomActions | EnhancedCustomActions;
  confirmButton?: ComponentPropsWithRef<typeof AlertDialogAction>;
  cancelButton?: ComponentPropsWithRef<typeof AlertDialogCancel> | null;
  alertDialogOverlay?: ComponentPropsWithRef<typeof AlertDialogOverlay>;
  alertDialogContent?: ComponentPropsWithRef<typeof AlertDialogContent>;
  alertDialogHeader?: ComponentPropsWithRef<typeof AlertDialogHeader>;
  alertDialogTitle?: ComponentPropsWithRef<typeof AlertDialogTitle>;
  alertDialogDescription?: ComponentPropsWithRef<typeof AlertDialogDescription>;
  alertDialogFooter?: ComponentPropsWithRef<typeof AlertDialogFooter>;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  config: ConfirmOptions;
  resolver: ((value: boolean) => void) | null;
}

export interface ConfirmContextValue {
  confirm: ConfirmFunction;
  updateConfig: ConfigUpdater;
}

export interface ConfirmFunction {
  (options: ConfirmOptions): Promise<boolean>;
  updateConfig?: ConfigUpdater;
}

export const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

const baseDefaultOptions: ConfirmOptions = {
  title: "",
  description: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  confirmButton: {},
  cancelButton: {},
  alertDialogContent: {},
  alertDialogHeader: {},
  alertDialogTitle: {},
  alertDialogDescription: {},
  alertDialogFooter: {}
};

function isLegacyCustomActions(fn: LegacyCustomActions | EnhancedCustomActions): fn is LegacyCustomActions {
  return fn.length === 2;
}

const ConfirmDialogContent: FC<{
  config: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
  setConfig: (config: ConfirmOptions | ((prev: ConfirmOptions) => ConfirmOptions)) => void;
}> = memo(({ config, onConfirm, onCancel, setConfig }) => {
  const {
    title,
    description,
    cancelButton,
    confirmButton,
    confirmText,
    cancelText,
    icon,
    contentSlot,
    customActions,
    alertDialogOverlay,
    alertDialogContent,
    alertDialogHeader,
    alertDialogTitle,
    alertDialogDescription,
    alertDialogFooter
  } = config;

  const renderActions = () => {
    if (!customActions) {
      return (
        <>
          <If condition={cancelButton !== null}>
            <AlertDialogCancel onClick={onCancel} {...cancelButton}>
              {cancelText}
            </AlertDialogCancel>
          </If>
          <AlertDialogAction onClick={onConfirm} {...confirmButton}>
            {confirmText}
          </AlertDialogAction>
        </>
      );
    }

    if (isLegacyCustomActions(customActions)) {
      return customActions(onConfirm, onCancel);
    }

    return customActions({
      confirm: onConfirm,
      cancel: onCancel,
      config,
      setConfig
    });
  };

  const renderTitle = () => {
    if (!title && !icon) {
      return null;
    }

    return (
      <AlertDialogTitle {...alertDialogTitle}>
        {icon}
        {title}
      </AlertDialogTitle>
    );
  };

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay {...alertDialogOverlay} />
      <AlertDialogContent {...alertDialogContent}>
        <AlertDialogHeader {...alertDialogHeader}>
          {renderTitle()}
          <If condition={description}>
            {(description) => (
              <AlertDialogDescription {...alertDialogDescription}>{description}</AlertDialogDescription>
            )}
          </If>
          {contentSlot}
        </AlertDialogHeader>
        <AlertDialogFooter {...alertDialogFooter}>{renderActions()}</AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPortal>
  );
});

ConfirmDialogContent.displayName = "ConfirmDialogContent";

const ConfirmDialog: FC<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  config: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
  setConfig: (config: ConfirmOptions | ((prev: ConfirmOptions) => ConfirmOptions)) => void;
}> = memo(({ isOpen, onOpenChange, config, onConfirm, onCancel, setConfig }) => (
  <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
    <ConfirmDialogContent config={config} onConfirm={onConfirm} onCancel={onCancel} setConfig={setConfig} />
  </AlertDialog>
));

ConfirmDialog.displayName = "ConfirmDialog";

export const ConfirmDialogProvider: FC<{
  defaultOptions?: ConfirmOptions;
  children: ReactNode;
}> = ({ defaultOptions = {}, children }) => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    config: baseDefaultOptions,
    resolver: null
  });

  const mergedDefaultOptions = useMemo(
    () => ({
      ...baseDefaultOptions,
      ...defaultOptions
    }),
    [defaultOptions]
  );

  const updateConfig = useCallback(
    (newConfig: ConfirmOptions | ((prev: ConfirmOptions) => ConfirmOptions)) => {
      setDialogState((prev) => ({
        ...prev,
        config: typeof newConfig === "function" ? newConfig(prev.config) : { ...prev.config, ...newConfig }
      }));
    },
    []
  );

  const confirm = useCallback(
    (options: ConfirmOptions) => {
      setDialogState((prev) => ({
        isOpen: true,
        config: { ...mergedDefaultOptions, ...options },
        resolver: prev.resolver
      }));
      return new Promise<boolean>((resolve) => {
        setDialogState((prev) => ({
          ...prev,
          resolver: resolve
        }));
      });
    },
    [mergedDefaultOptions]
  );

  const handleConfirm = useCallback(() => {
    setDialogState((prev) => {
      if (prev.resolver) {
        prev.resolver(true);
      }
      return {
        ...prev,
        isOpen: false,
        resolver: null
      };
    });
  }, []);

  const handleCancel = useCallback(() => {
    setDialogState((prev) => {
      if (prev.resolver) {
        prev.resolver(false);
      }
      return {
        ...prev,
        isOpen: false,
        resolver: null
      };
    });
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleCancel();
      }
    },
    [handleCancel]
  );

  const contextValue = useMemo(
    () => ({
      confirm,
      updateConfig
    }),
    [confirm, updateConfig]
  );

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onOpenChange={handleOpenChange}
        config={dialogState.config}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        setConfig={updateConfig}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = use(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  }

  const { confirm, updateConfig } = context;

  const enhancedConfirm = confirm;
  enhancedConfirm.updateConfig = updateConfig;

  return enhancedConfirm as ConfirmFunction & {
    updateConfig: ConfirmContextValue["updateConfig"];
  };
};

type ConfirmType = "delete" | "warning" | "successs";

const IconWrapper = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("flex size-10 items-center justify-center rounded-full", className)}>{children}</div>
);

const alertDialogTitle = {
  className: "flex items-center gap-2"
};
export const confirmDialogConfig: Record<ConfirmType, ConfirmOptions> = {
  delete: {
    icon: (
      <IconWrapper>
        <Trash2 className='size-5 text-fail' />
      </IconWrapper>
    ),
    confirmButton: {
      className: buttonVariants({ variant: "destructive" })
    },
    alertDialogTitle
  },
  warning: {
    icon: (
      <IconWrapper>
        <CircleAlert className='size-5 text-pending' />
      </IconWrapper>
    ),
    confirmButton: {
      className: buttonVariants({ variant: "default" })
    },
    alertDialogTitle
  },
  successs: {
    icon: (
      <IconWrapper>
        <CircleCheck className='size-5 text-success' />
      </IconWrapper>
    ),
    confirmButton: {
      className: buttonVariants({ variant: "default" })
    },
    cancelButton: null,
    alertDialogTitle
  }
};
