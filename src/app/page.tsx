'use client';

import { Antonio } from 'next/font/google';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const antonio = Antonio({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const backgrounds = [
  'bg-white text-black',     // Light theme
  'bg-black text-white',     // Dark theme
];

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bgClass, setBgClass] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Alternate between two colorways
    const theme = Math.random() > 0.5 ? backgrounds[0] : backgrounds[1];
    setBgClass(theme);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center transition-all duration-300 ${antonio.className} ${bgClass}`}>
      {/* Navigation */}
      <div className="absolute top-4 left-4">
        <Link
          href="/enter"
          className="text-base sm:text-xl font-extrabold tracking-tight hover:underline hover:scale-105 transition-all"
        >
          ENTER
        </Link>
      </div>
      <div className="absolute top-4 right-4">
        <Link
          href="/countdown"
          className="text-base sm:text-xl font-extrabold tracking-tight hover:underline hover:scale-105 transition-all"
        >
          COUNTDOWN
        </Link>
      </div>

      {/* Title */}
      <h1 className="italic text-4xl sm:text-6xl font-extrabold mb-6 text-center px-4 break-words animate-scale-pulse tracking-tighter">
        AFTERPIECE
      </h1>

      {/* Clock */}
      <p className="text-xl sm:text-3xl font-mono text-center px-4 break-words">
        {formatTime(currentTime)}
      </p>
    </main>
  );
}
