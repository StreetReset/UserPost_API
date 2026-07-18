import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse — мысли без лишнего шума",
  description: "Публикуйте заметки, читайте авторов и управляйте своими постами.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
