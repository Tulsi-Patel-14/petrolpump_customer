import { create } from 'zustand';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'error' | 'info' | 'success';
  textColor: string;
  showToast: (message: string, options?: { type?: 'error' | 'info' | 'success'; textColor?: string; duration?: number }) => void;
  hideToast: () => void;
}

let timeoutId: any = null;

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'error',
  textColor: 'red',
  showToast: (message, options) => {
    if (timeoutId) clearTimeout(timeoutId);
    set({
      visible: true,
      message,
      type: options?.type || 'error',
      textColor: options?.textColor || 'red',
    });
    timeoutId = setTimeout(() => {
      set({ visible: false });
    }, options?.duration || 3500);
  },
  hideToast: () => {
    if (timeoutId) clearTimeout(timeoutId);
    set({ visible: false });
  },
}));

export const showCustomToast = (message: string, textColor: string = 'red') => {
  useToastStore.getState().showToast(message, { textColor });
};
