import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import type { Metadata } from "next";
import styles from "./landing.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  return { title: `LuxuryBeauty — ${t("hero.title2")}` };
}

const FEATURES = [
  { key: "appointments", icon: "📅", color: "rgba(99,102,241,0.15)"  },
  { key: "pos",          icon: "💰", color: "rgba(16,185,129,0.15)"  },
  { key: "clients",      icon: "👥", color: "rgba(245,158,11,0.15)"  },
  { key: "employees",    icon: "✂️", color: "rgba(236,72,153,0.15)"  },
  { key: "sessions",     icon: "⏱️", color: "rgba(14,165,233,0.15)"  },
  { key: "dashboard",    icon: "📊", color: "rgba(168,85,247,0.15)"  },
  { key: "memberships",  icon: "👑", color: "rgba(251,191,36,0.15)"  },
] as const;

export default function LandingPage() {
  const t = useTranslations("landing");

  return (
    <main className={styles.main} data-theme="dark">

      {/* Fondo animado */}
      <div className={styles.bg}>
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgOrb3} />
        <div className={styles.bgGrid} />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.navIcon}>✂</span>
          <span className={styles.navLogo}>LuxuryBeauty</span>
        </div>
        <Link href="/login" className={styles.navLogin}>
          {t("nav.login")}
        </Link>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          {t("badge")}
        </div>

        <h1 className={styles.heroTitle}>
          {t("hero.title1")}
          <br />
          <span className={styles.heroGradient}>{t("hero.title2")}</span>
          <br />
          {t("hero.title3")}
        </h1>

        <p className={styles.heroSub}>{t("hero.subtitle")}</p>

        <div className={styles.heroCtas}>
          <Link href="/login" className={styles.ctaPrimary}>
            {t("hero.cta")}
            <span className={styles.ctaArrow}>→</span>
          </Link>
          <a href="#features" className={styles.ctaSecondary}>
            {t("hero.ctaSecondary")}
          </a>
        </div>

        <div className={styles.heroStats}>
          {(["digital", "available", "platform"] as const).map((key) => (
            <div key={key} className={styles.heroStat}>
              <span className={styles.heroStatValue}>
                {key === "digital" ? "100%" : key === "available" ? "24/7" : "1"}
              </span>
              <span className={styles.heroStatLabel}>{t(`stats.${key}`)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className={styles.features} id="features">
        <div className={styles.featuresHeader}>
          <p className={styles.featuresEyebrow}>{t("features.eyebrow")}</p>
          <h2 className={styles.featuresTitle}>{t("features.title")}</h2>
        </div>

        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.key} className={styles.featureCard}>
              <div className={styles.featureIcon} style={{ background: f.color }}>
                {f.icon}
              </div>
              <h3 className={styles.featureTitle}>
                {t(`features.${f.key}.title`)}
              </h3>
              <p className={styles.featureDesc}>
                {t(`features.${f.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Final ───────────────────────────────────────────────── */}
      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaGlow} />
          <p className={styles.ctaEyebrow}>{t("cta.eyebrow")}</p>
          <h2 className={styles.ctaTitle}>{t("cta.title")}</h2>
          <p className={styles.ctaSub}>{t("cta.subtitle")}</p>
          <Link href="/login" className={styles.ctaPrimaryLg}>
            {t("cta.button")}
            <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>✂ LuxuryBeauty</span>
        <span className={styles.footerCopy}>
          © {new Date().getFullYear()} — {t("footer.rights")}
        </span>
      </footer>

    </main>
  );
}