import Image from "next/image";

import styles from "./data-insights.module.css";

export function BrandMark() {
  return (
    <Image
      className={styles.brandMark}
      src="/brand/cfi-logo.svg"
      alt="CFI Group"
      width={169}
      height={43}
      priority
    />
  );
}
