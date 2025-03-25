'use client';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-white/60 dark:bg-gray-900/60">
      <div className="relative flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-12 bg-gradient-to-b from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 rounded-full"
            style={{
              animation: `pulse 1.5s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}