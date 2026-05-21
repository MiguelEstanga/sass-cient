import { Badge } from "@/components/ui/Badge";

type LoanStatus = "pending" | "active" | "paid" | "cancelled" | "defaulted";

const config: Record<LoanStatus, { label: string; variant: "success" | "warning" | "error" | "info" | "default" }> = {
  pending: { label: "Pendiente", variant: "warning" },
  active: { label: "Activo", variant: "info" },
  paid: { label: "Pagado", variant: "success" },
  cancelled: { label: "Cancelado", variant: "default" },
  defaulted: { label: "Mora", variant: "error" },
};

interface Props {
  status: LoanStatus;
}

export function StatusBadge({ status }: Props) {
  const { label, variant } = config[status] || config.pending;
  return <Badge variant={variant}>{label}</Badge>;
}