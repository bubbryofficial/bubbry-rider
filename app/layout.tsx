import type { Metadata } from "next";
export const metadata: Metadata = { title: "Bubbry Rider", description: "Delivery rider app" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
