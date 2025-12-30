import { useState, useCallback } from "react";
import { AxiosError } from "axios";

interface UpgradeModalState {
  isOpen: boolean;
  feature: string;
  message: string;
  used?: number;
  limit?: number;
}

export function useUpgradeModal() {
  const [modalState, setModalState] = useState<UpgradeModalState>({
    isOpen: false,
    feature: "",
    message: "",
  });

  const handleApiError = useCallback((error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 402) {
      const data = error.response.data;
      setModalState({
        isOpen: true,
        feature: data.feature || "unknown",
        message:
          data.error || "You've reached your limit. Upgrade to continue!",
        used: data.used,
        limit: data.limit,
      });
      return true; // Error was handled
    }
    return false; // Error was not a 402
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    modalState,
    handleApiError,
    closeModal,
  };
}
