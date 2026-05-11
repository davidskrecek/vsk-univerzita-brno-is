export type ToastType = "success" | "warning" | "error";

export interface ShowToastInput {
  message: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastContextValue {
  showToast: (input: ShowToastInput) => void;
  success: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
}

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: "primary" | "danger";
}

export type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>;


