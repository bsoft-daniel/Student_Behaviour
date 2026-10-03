import Swal from 'sweetalert2';

const ST_MARTIN_THEME = {
  confirmButtonColor: '#0b3c74',
  cancelButtonColor: '#64748b',
  dangerConfirmColor: '#d92929',
  successConfirmColor: '#15803d',
  borderRadius: '12px'
};

export const AppSweetAlert = {
  /**
   * Success Alert
   */
  success: ({ title = 'Success!', text = 'Action completed successfully.', timer = 2500 }) => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      timer,
      timerProgressBar: true,
      confirmButtonColor: ST_MARTIN_THEME.successConfirmColor,
      customClass: {
        popup: 'rounded-2xl font-sans text-xs',
        confirmButton: 'px-4 py-2 text-xs font-bold rounded-lg'
      }
    });
  },

  /**
   * Error Alert
   */
  error: ({ title = 'Error!', text = 'Something went wrong. Please try again.' }) => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonColor: ST_MARTIN_THEME.dangerConfirmColor,
      customClass: {
        popup: 'rounded-2xl font-sans text-xs',
        confirmButton: 'px-4 py-2 text-xs font-bold rounded-lg'
      }
    });
  },

  /**
   * Warning Alert
   */
  warning: ({ title = 'Warning!', text = 'Please check the input data.' }) => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonColor: ST_MARTIN_THEME.confirmButtonColor,
      customClass: {
        popup: 'rounded-2xl font-sans text-xs',
        confirmButton: 'px-4 py-2 text-xs font-bold rounded-lg'
      }
    });
  },

  /**
   * Info Alert
   */
  info: ({ title = 'Information', text = '' }) => {
    return Swal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonColor: ST_MARTIN_THEME.confirmButtonColor,
      customClass: {
        popup: 'rounded-2xl font-sans text-xs',
        confirmButton: 'px-4 py-2 text-xs font-bold rounded-lg'
      }
    });
  },

  /**
   * Reusable Confirmation Alert (Delete, Deactivate, Status Change, Logout)
   */
  confirm: async ({
    title = 'Are you sure?',
    text = 'You won\'t be able to revert this action!',
    icon = 'warning',
    confirmText = 'Yes, Proceed',
    cancelText = 'Cancel',
    isDanger = true,
    onConfirm = null,
    onCancel = null
  }) => {
    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: isDanger ? ST_MARTIN_THEME.dangerConfirmColor : ST_MARTIN_THEME.confirmButtonColor,
      cancelButtonColor: ST_MARTIN_THEME.cancelButtonColor,
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl font-sans text-xs',
        confirmButton: 'px-4 py-2 text-xs font-bold rounded-lg',
        cancelButton: 'px-4 py-2 text-xs font-bold rounded-lg'
      }
    });

    if (result.isConfirmed) {
      if (onConfirm) await onConfirm();
      return true;
    } else {
      if (onCancel) await onCancel();
      return false;
    }
  }
};

export default AppSweetAlert;
