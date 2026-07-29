import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata = {
  title: "ScrinHouse | Premium iPhone Screens & Professional Repairs",
  description: "Quality-tested replacement screens, expert repairs, and convenient pickup services.",
};

import { CartProvider } from "@/lib/context/CartContext";
import { AuthProvider } from "@/lib/auth/AuthProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


