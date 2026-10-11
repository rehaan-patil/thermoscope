import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThermoScope — Research-Grade Battery Thermal Analytics",
  description:
    "Understand the signals before they become risks. Statistical engineering decision support investigating lithium-ion battery abnormal thermal excursions using Poisson and Exponential point-process models on NASA B0005 data.",
  keywords: [
    "Battery Thermal Analytics",
    "Lithium-ion",
    "NASA Battery Aging Dataset",
    "Poisson Distribution",
    "Exponential Distribution",
    "Reliability Engineering",
    "Thermal Runaway Prevention",
  ],
  authors: [{ name: "ThermoScope Scientific Team" }],
  openGraph: {
    title: "ThermoScope — Research-Grade Battery Thermal Analytics",
    description: "Understand the signals before they become risks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-brand-cyan">
        {children}
      </body>
    </html>
  );
}
