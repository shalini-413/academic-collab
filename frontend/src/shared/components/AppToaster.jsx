import { Toaster } from 'react-hot-toast';

const AppToaster = () => (
  <Toaster
    position="top-right"
    gutter={10}
    containerClassName="app-toast-container"
    toastOptions={{
      duration: 3600,
      className: 'app-toast',
      success: {
        className: 'app-toast app-toast-success'
      },
      error: {
        duration: 4500,
        className: 'app-toast app-toast-error'
      }
    }}
  />
);

export default AppToaster;

