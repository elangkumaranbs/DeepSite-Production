import { Navigation } from "@/components/public/navigation";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen font-sans">
      <Navigation />
      {children}
    </div>
  );
}
