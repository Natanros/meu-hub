import { useState } from "react";

export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function Toast() {
    if (!toast) return null;
    return (
      <div
        className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 text-white ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}
      >
        {toast.message}
      </div>
    );
  }

  return { showToast, Toast };
}
