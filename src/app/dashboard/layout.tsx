import TopNav from '@/components/TopNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-black relative transition-colors duration-300">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <TopNav />
      
      <main className="relative z-0">
        {children}
      </main>

      {/* Blexi Stamp */}
      <div className="fixed bottom-6 right-6 z-10">
        <div className="text-4xl font-black text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 px-4 py-2 border border-black/10 dark:border-white/10 rounded-xl backdrop-blur-md bg-white/10 dark:bg-white/5 transition-colors">
          BLEXI
        </div>
      </div>
    </div>
  );
}