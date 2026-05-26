import Link from "next/link";
import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <main className={styles.main}>

      {/* ── Fondo animado ───────────────────────────────────────────── */}
      <div className={styles.bg}>
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgOrb3} />
        <div className={styles.bgGrid} />
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.navIcon}>✂</span>
          <span className={styles.navLogo}>LuxuryBeauty</span>
        </div>
        <Link href="/login" className={styles.navLogin}>
          Iniciar sesión
        </Link>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          Sistema de gestión para salones de belleza
        </div>

        <h1 className={styles.heroTitle}>
          Tu salón,
          <br />
          <span className={styles.heroGradient}>perfectamente</span>
          <br />
          organizado
        </h1>

        <p className={styles.heroSub}>
          Gestiona citas, empleados, ventas y clientes desde
          un solo lugar. Diseñado para salones que quieren crecer.
        </p>

        <div className={styles.heroCtas}>
          <Link href="/login" className={styles.ctaPrimary}>
            Entrar al sistema
            <span className={styles.ctaArrow}>→</span>
          </Link>
          <a href="#features" className={styles.ctaSecondary}>
            Ver funciones
          </a>
        </div>

        {/* Stats */}
        <div className={styles.heroStats}>
          {[
            { value: "100%", label: "Digital" },
            { value: "24/7", label: "Disponible" },
            { value: "1 sola", label: "Plataforma" },
          ].map((s) => (
            <div key={s.label} className={styles.heroStat}>
              <span className={styles.heroStatValue}>{s.value}</span>
              <span className={styles.heroStatLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════════ */}
      <section className={styles.features} id="features">
        <div className={styles.featuresHeader}>
          <p className={styles.featuresEyebrow}>Todo en uno</p>
          <h2 className={styles.featuresTitle}>
            Todo lo que necesitas para tu salón
          </h2>
        </div>

        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div
                className={styles.featureIcon}
                style={{ background: f.color }}
              >
                {f.icon}
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════════ */}
      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaGlow} />
          <p className={styles.ctaEyebrow}>¿Listo para empezar?</p>
          <h2 className={styles.ctaTitle}>
            Lleva tu salón al siguiente nivel
          </h2>
          <p className={styles.ctaSub}>
            Accede a tu panel de control y comienza a gestionar
            tu negocio de forma profesional.
          </p>
          <Link href="/login" className={styles.ctaPrimaryLg}>
            Acceder ahora
            <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>
          ✂ LuxuryBeauty
        </span>
        <span className={styles.footerCopy}>
          © {new Date().getFullYear()} — Todos los derechos reservados
        </span>
      </footer>
    </main>
  );
}

// ── Features data ──────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon:  "📅",
    title: "Gestión de citas",
    desc:  "Calendario semanal con drag & drop. Asigna empleados, evita choques de horario y lleva el control al minuto.",
    color: "rgba(99, 102, 241, 0.15)",
  },
  {
    icon:  "💰",
    title: "Punto de venta",
    desc:  "Registra ventas de productos y servicios con múltiples métodos de pago. Genera comprobantes al instante.",
    color: "rgba(16, 185, 129, 0.15)",
  },
  {
    icon:  "👥",
    title: "Gestión de clientes",
    desc:  "Historial completo de cada cliente. Preferencias, citas anteriores y pagos en un solo perfil.",
    color: "rgba(245, 158, 11, 0.15)",
  },
  {
    icon:  "✂️",
    title: "Control de empleados",
    desc:  "Horarios, roles y sesiones de trabajo. Mira en tiempo real quién está atendiendo y cuánto tiempo lleva.",
    color: "rgba(236, 72, 153, 0.15)",
  },
  {
    icon:  "⏱️",
    title: "Sesiones en vivo",
    desc:  "Cronómetro persistente por servicio. El tiempo sigue contando aunque recargues la página.",
    color: "rgba(14, 165, 233, 0.15)",
  },
  {
    icon:  "📊",
    title: "Dashboard de métricas",
    desc:  "KPIs en tiempo real: ingresos del día, citas activas, clientes nuevos y sesiones en progreso.",
    color: "rgba(168, 85, 247, 0.15)",
  },
];