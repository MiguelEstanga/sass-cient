import { useState, useCallback } from "react";

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const DEFAULT_STATE: ConfirmState = {
  open: false,
  title: "",
  message: "",
  onConfirm: () => {},
};

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback(
    ({
      title = "¿Estás seguro?",
      message,
      onConfirm,
    }: {
      title?: string;
      message: string;
      onConfirm: () => Promise<void> | void;
    }) => {
      setState({
        open: true,
        title,
        message,
        onConfirm: async () => {
          setLoading(true);
          try {
            await onConfirm();
          } finally {
            setLoading(false);
            setState(DEFAULT_STATE);
          }
        },
      });
    },
    []
  );

  const cancel = useCallback(() => {
    if (!loading) setState(DEFAULT_STATE);
  }, [loading]);

  return {
    confirm,
    cancel,
    loading,
    dialogProps: {
      open: state.open,
      title: state.title,
      message: state.message,
      loading,
      onConfirm: state.onConfirm,
      onCancel: cancel,
    },
  };
}