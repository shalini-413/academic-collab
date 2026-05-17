import toast from 'react-hot-toast';

const toastDefaults = {
  duration: 3600
};

export const notify = {
  success(message, options) {
    return toast.success(message, { ...toastDefaults, ...options });
  },

  error(message, options) {
    return toast.error(message, { ...toastDefaults, duration: 4500, ...options });
  },

  info(message, options) {
    return toast(message, {
      ...toastDefaults,
      icon: 'i',
      ...options
    });
  },

  promise(promise, messages, options) {
    return toast.promise(promise, messages, options);
  }
};

