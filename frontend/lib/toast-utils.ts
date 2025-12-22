import { toast, ToastOptions } from 'react-toastify';


export const toastConfig: ToastOptions = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
  className: "font-rubik",
};

// Success toast
export const showSuccessToast = (message: string) => {
  toast.success(message, toastConfig);
};

// Error toast
export const showErrorToast = (message: string) => {
  toast.error(message, toastConfig);
};

// Info toast
export const showInfoToast = (message: string) => {
  toast.info(message, toastConfig);
};

// Warning toast
export const showWarningToast = (message: string) => {
  toast.warning(message, toastConfig);
};

// Loading toast
export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    ...toastConfig,
    autoClose: false,
  });
};

// Update toast
export const updateToast = (toastId: any, type: 'success' | 'error' | 'info' | 'warning', message: string) => {
  const config = {
    ...toastConfig,
    isLoading: false,
    autoClose: 3000,
  };

  switch (type) {
    case 'success':
      toast.update(toastId, { render: message, type: 'success', ...config });
      break;
    case 'error':
      toast.update(toastId, { render: message, type: 'error', ...config });
      break;
    case 'info':
      toast.update(toastId, { render: message, type: 'info', ...config });
      break;
    case 'warning':
      toast.update(toastId, { render: message, type: 'warning', ...config });
      break;
  }
};