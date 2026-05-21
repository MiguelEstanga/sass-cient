import { useTranslations } from "next-intl";

export default function DashboardPage() {
  return (
    <div style={{ padding: "var(--spacing-xl)" }}>
      <h1 style={{ fontSize: "var(--font-size-2xl)" }}>Dashboard 🎉</h1>
      <p>Bienvenido al panel principal</p>
    </div>
  );
}