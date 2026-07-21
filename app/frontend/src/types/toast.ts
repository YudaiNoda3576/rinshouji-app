// トースト通知の共有型。

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  desc?: string;
  leaving?: boolean;
}

// トーストを発火する側が渡す入力（id/leaving は内部で付与）。
export type ToastInput = Omit<Toast, 'id' | 'leaving'> & { duration?: number };

export type PushToast = (toast: ToastInput) => void;
