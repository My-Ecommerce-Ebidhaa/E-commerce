import { Header } from '@/components/shared/header/header';
import { Footer } from '@/components/shared/footer/footer';
import { CartDrawer } from '@/components/shared/cart/cart-drawer';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
