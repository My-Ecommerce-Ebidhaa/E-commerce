import { PlatformSidebar } from '@/components/admin/layout/platform-sidebar';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <PlatformSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">
            Platform Administration
          </h1>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Production
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
