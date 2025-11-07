'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRandomTheme } from '@/utils/theme';
import { antonio } from '@/fonts/antonio'; // Make sure the path is correct
import Link from 'next/link';

export default function CountdownPage() {
    const [theme, setTheme] = useState({ bg: '', text: '', isDark: true });
    const router = useRouter();

    useEffect(() => {
        setTheme(getRandomTheme());
    }, []);

    const dropDate = new Date('2025-09-14T18:00:00Z').getTime();
    const [timeLeft, setTimeLeft] = useState(dropDate - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = dropDate - now;
            if (diff <= 0) {
                clearInterval(interval);
                router.push('/draw');
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const getTime = () => {
        const seconds = Math.floor((timeLeft / 1000) % 60);
        const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
        const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        return { days, hours, minutes, seconds };
    };

    const { days, hours, minutes, seconds } = getTime();

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center pt-20 transition-all duration-300 ${theme.bg} ${theme.text} ${antonio.className}`}>
            {/* Top Navigation */}
            <div className="absolute top-4 left-4">
                <Link
                    href="/enter"
                    className={`text-base sm:text-xl font-extrabold tracking-tight hover:underline hover:scale-105 transition-all ${theme.text}`}
                >
                    ENTER
                </Link>
            </div>
            <div className="absolute top-4 right-4">
                <Link
                    href="/"
                    className={`text-base sm:text-xl font-extrabold tracking-tight hover:underline hover:scale-105 transition-all ${theme.text}`}
                >
                    HOME
                </Link>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold mb-4 text-center">COUNTDOWN</h1>
            <div className="text-2xl sm:text-4xl font-mono text-center px-4 break-words">
                {days}d {hours}h {minutes}m {seconds}s
            </div>
        </div>
    );
}
