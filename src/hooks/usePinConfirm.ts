import { useState, useCallback } from "react";
import { pinService } from "@/services/pin.service";
import { ApiError } from "@/lib/api/errors";

interface PinConfirmState {
  open:      boolean;
  title:     string;
  message:   string;
  onConfirm: (pin : string) => void;
}

const DEFAULT_STATE: PinConfirmState = {
  open:      false,
  title:     "",
  message:   "",
  onConfirm: () => {},
};

export function usePinConfirm() {
  const [state, setState]     = useState<PinConfirmState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const pinConfirm = useCallback(({
    title   = "Acción protegida",
    message,
    onConfirm,
  }: {
    title?:    string;
    message:   string;
    onConfirm: () => Promise<void> | void;
  }) => {
    setError(null);
    setState({
      open:    true,
      title,
      message,
      onConfirm: async (pin: string) => {
        setLoading(true);
        setError(null);
        try {
         // Verificar PIN en el backend
          await pinService.verify(pin);
         // PIN correcto — ejecutar la acción
          await onConfirm();
          setState(DEFAULT_STATE);
        } catch (err) {
          // PIN incorrecto — mostrar error sin cerrar el modal
          const msg = err instanceof ApiError
            ? err.message
            : "PIN incorrecto";
          setError(msg);
        } finally {
          setLoading(false);
        }
      },
    });
  }, []);

  const cancel = useCallback(() => {
    if (!loading) {
      setState(DEFAULT_STATE);
      setError(null);
    }
  }, [loading]);

  return {
    pinConfirm,
    cancel,
    loading,
    pinDialogProps: {
      open:      state.open,
      title:     state.title,
      message:   state.message,
      loading,
      error,
      onConfirm: state.onConfirm,
      onCancel:  cancel,
    },
  };
}