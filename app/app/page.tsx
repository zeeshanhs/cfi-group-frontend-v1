import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/data-insights/brand-mark";
import { FeatureHubAccount } from "@/components/data-insights/feature-hub-account";

import styles from "./feature-hub.module.css";

export const metadata: Metadata = {
  title: "Internal workspace",
  description: "Choose a CFI Group internal reporting experience.",
};

const features = [
  {
    eyebrow: "Synthetic data experience",
    title: "Data Insights Chat",
    description:
      "Ask documented questions about fictional bid data, review persistent conversations, and inspect simulated report snapshots.",
    detail: "Fictional fixtures · Simulated responses · No LLM",
    href: "/app/chat",
    action: "Open Data Insights Chat",
  },
  {
    eyebrow: "Repository reporting",
    title: "Reports",
    description:
      "Browse available reports built from the repository’s local static reporting extract, including the Weekly Sales Summary.",
    detail: "Static extract · Read-only reports · Printable views",
    href: "/reports",
    action: "Browse reports",
  },
] as const;

export default function FeatureHubPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark />
        <span className={styles.productName}>Internal workspace</span>
        <FeatureHubAccount />
      </header>

      <div className={styles.environmentStrip}>
        Local demonstration environment · No live business integrations
      </div>

      <section className={styles.intro} aria-labelledby="workspace-title">
        <p className={styles.eyebrow}>CFI Group tools</p>
        <h1 id="workspace-title">Choose a feature</h1>
        <p>
          Open the experience that matches the work you want to do. Each
          feature states the source and limitations of its data.
        </p>
      </section>

      <section className={styles.featureGrid} aria-label="Available features">
        {features.map((feature, index) => (
          <article className={styles.featureCard} key={feature.title}>
            <div className={styles.cardNumber} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className={styles.cardBody}>
              <p className={styles.cardEyebrow}>{feature.eyebrow}</p>
              <h2>{feature.title}</h2>
              <p className={styles.cardDescription}>{feature.description}</p>
              <p className={styles.cardDetail}>{feature.detail}</p>
              <Link className={styles.featureLink} href={feature.href}>
                {feature.action}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </section>

      <p className={styles.disclosure}>
        Data Insights Chat uses fictional fixtures and deterministic simulated
        responses. Reports use a limited local extract and should not be
        presented as live or exhaustive.
      </p>
    </main>
  );
}
