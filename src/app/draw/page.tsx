'use client';

import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import useSound from 'use-sound';
import Link from 'next/link';
import { getRandomTheme } from '@/utils/theme';

export default function DrawPage() {
    const [raffleIds, setRaffleIds] = useState<string[]>([]);
    const [current, setCurrent] = useState('');
    const [winner, setWinner] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const [play] = useSound('/balloon-pop.mp3');
    const [theme, setTheme] = useState({ bg: '', text: '' });

    useEffect(() => {
        setTheme(getRandomTheme());

        const fetchEntries = async () => {
            const res = await fetch('/api/get-entries');
            const data = await res.json();
            const ids = data.entries.map((entry: any) => entry.raffleId);
            setRaffleIds(ids);
        };
        fetchEntries();
    }, []);

    useEffect(() => {
        if (raffleIds.length === 0 || !isDrawing) return;

        const shuffleInterval = setInterval(() => {
            const random = raffleIds[Math.floor(Math.random() * raffleIds.length)];
            setCurrent(random);
        }, 300);

        setTimeout(() => {
            clearInterval(shuffleInterval);
            const selected = raffleIds[Math.floor(Math.random() * raffleIds.length)];
            setWinner(selected);
            setIsDrawing(false);
            setShowConfetti(true);
            play();

            fetch('/api/process-winner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ winnerId: selected }),
            });
        }, 5000);

        return () => clearInterval(shuffleInterval);
    }, [raffleIds]);

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center transition-all duration-300 ${theme.bg} ${theme.text}`}>
            {showConfetti && <Confetti />}

            <h1
                className={`text-2xl sm:text-4xl font-bold mb-6 text-center transition-opacity duration-1000 ${winner ? 'opacity-0' : 'opacity-100'}`}
            >
                Drawing Winner
            </h1>

            <div className={`text-2xl sm:text-4xl font-mono mb-3 sm:mb-5 text-center break-words px-4 transition-all duration-700 ${winner ? 'scale-105 animate-bounce' : ''}`}>
                {winner ? `Winner! ${winner}` : current || 'Shuffling...'}
            </div>

            {winner && (
                <>
                    <p className="text-lg mt-4">An email has been sent to the winner!</p>
                    <Link href="/" className={`mt-6 text-xl font-extrabold tracking-tight hover:underline hover:scale-105 transition-all ${theme.text}`}>
                        ← Back to Home
                    </Link>
                </>
            )}
        </div>
    );
}
