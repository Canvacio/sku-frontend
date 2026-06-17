import './globals.css';

export const metadata = {
  title: 'Cofibean AI',
  description: 'Your AI-powered coffee commodity assistant',
  verification: {
    google: "google8ab21ece0f3924e0",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
