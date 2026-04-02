import { Header } from '@/components/buyer/Header';
import { Footer } from '@/components/buyer/Footer';
import { CompareBar } from '@/components/buyer/CompareBar';

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CompareBar />
    </>
  );
}
