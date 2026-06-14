import './globals.css';

export const metadata = {
  title: 'Cofibean AI',
  description: 'Your AI-powered coffee commodity assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
