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
      <div className="print:hidden">
        <Header />
      </div>
      <main className="flex-1">{children}</main>
      <div className="print:hidden">
        <Footer />
        <CompareBar />
      </div>
    </>
  );
}
