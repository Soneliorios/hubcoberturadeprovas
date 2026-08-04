"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/** Script de rastreamento da HubSpot — apenas nas páginas públicas
 *  (admin é ferramenta interna e não deve poluir a análise de marketing). */
export default function HubspotTracking() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <Script
      id="hs-script-loader"
      src="https://js.hs-scripts.com/20156158.js"
      strategy="afterInteractive"
    />
  );
}
