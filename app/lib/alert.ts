// app/lib/alert.ts
import Swal from "sweetalert2";

export const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#2563EB",
    timer: 2000,
    timerProgressBar: true,
  });
};

export const showError = (title: string, text?: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#EF4444",
  });
};

export const showWarning = (title: string, text?: string) => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonColor: "#F59E0B",
  });
};

export const showInfo = (title: string, text?: string) => {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: "#2563EB",
  });
};

export const confirmDialog = async (options: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  icon?: "warning" | "question" | "error" | "info";
}): Promise<boolean> => {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: options.icon || "warning",
    showCancelButton: true,
    confirmButtonColor: options.confirmButtonColor || "#EF4444",
    cancelButtonColor: "#64748B",
    confirmButtonText: options.confirmButtonText || "Yes, delete it",
    cancelButtonText: options.cancelButtonText || "Cancel",
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const toastSuccess = (title: string) => {
  Toast.fire({
    icon: "success",
    title,
  });
};

export const toastError = (title: string) => {
  Toast.fire({
    icon: "error",
    title,
  });
};

export default Swal;

