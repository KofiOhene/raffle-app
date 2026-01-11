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
    const [isDrawing, setIsDrawing] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [play] = useSound('/balloon-pop.mp3');
    const [theme, setTheme] = useState({ bg: '', text: '' });
    const [adminKey, setAdminKey] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authError, setAuthError] = useState('');
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        setTheme(getRandomTheme());
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setFetchError('');

        try {
            const res = await fetch('/api/get-entries', {
                headers: {
                    'Authorization': `Bearer ${adminKey}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                const ids = data.entries.map((entry: { raffleId: string }) => entry.raffleId);
                if (ids.length === 0) {
                    setFetchError('No entries found in the raffle.');
                    return;
                }
                setRaffleIds(ids);
                setIsAuthenticated(true);
                setIsDrawing(true);
            } else if (res.status === 401) {
                setAuthError('Invalid admin key. Please try again.');
            } else {
                setAuthError('Authentication failed. Please try again.');
            }
        } catch {
            setAuthError('Network error. Please check your connection.');
        }
    };

    useEffect(() => {
        if (raffleIds.length === 0 || !isDrawing) return;

        const shuffleInterval = setInterval(() => {
            const random = raffleIds[Math.floor(Math.random() * raffleIds.length)];
            setCurrent(random);
        }, 300);

        const drawTimeout = setTimeout(() => {
            clearInterval(shuffleInterval);
            const selected = raffleIds[Math.floor(Math.random() * raffleIds.length)];
            setWinner(selected);
            setIsDrawing(false);
            setShowConfetti(true);
            play();

            fetch('/api/process-winner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminKey}`,
                },
                body: JSON.stringify({ winnerId: selected }),
            }).catch(() => {
                // Silently fail - winner is still selected
            });
        }, 5000);

        return () => {
            clearInterval(shuffleInterval);
            clearTimeout(drawTimeout);
        };
    }, [raffleIds, isDrawing, adminKey, play]);

    // Admin login screen
    if (!isAuthenticated) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center transition-all duration-300 ${theme.bg} ${theme.text}`}>
                <h1 className="text-2xl sm:text-4xl font-bold mb-6 text-center">
                    Admin Access Required
                </h1>
                <form onSubmit={handleAuth} className="w-full max-w-sm px-4">
                    <input
                        type="password"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        placeholder="Enter Admin Key"
                        className="w-full p-3 rounded bg-black/20 border border-current text-center mb-4"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full p-3 font-bold hover:underline hover:scale-105 transition"
                    >
                        Access Draw
                    </button>
                </form>
                {authError && (
                    <p className="text-red-500 mt-4 text-center">{authError}</p>
                )}
                {fetchError && (
                    <p className="text-yellow-500 mt-4 text-center">{fetchError}</p>
                )}
                <Link href="/" className="mt-6 text-xl font-extrabold tracking-tight hover:underline hover:scale-105 transition-all">
                    ← Back to Home
                </Link>
            </div>
        );
    }

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
