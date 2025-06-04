export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"
    data-lt-installed="true">
      <body>{children}</body>
    </html>
  );
}
