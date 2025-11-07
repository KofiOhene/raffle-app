'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRandomTheme } from '@/utils/theme';
import { antonio } from '@/fonts/antonio'; // Make sure this path matches your setup

export default function RaffleForm() {
    const [theme, setTheme] = useState({ bg: '', text: '', isDark: true });

    useEffect(() => {
        setTheme(getRandomTheme());
    }, []);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });
    const [status, setStatus] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Submitting...');

        const res = await fetch('/api/raffle-entry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        const result = await res.json();

        if (res.ok) {
            setStatus('You’re entered! Check your email for your raffle number.');
        } else {
            setStatus(result.error || 'Something went wrong. Try again.');
        }
    };

    const inputStyle = `w-full p-2 rounded bg-transparent focus:outline-none placeholder:opacity-80 ${theme.isDark ? 'text-white' : 'text-black'
        }`;

    const containerStyle = `w-[90%] sm:max-w-md ${theme.isDark
        ? 'bg-black bg-opacity-70 text-white'
        : 'bg-white bg-opacity-90 text-black'
        } backdrop-blur p-6 rounded-xl space-y-4`;

    return (
        <div
            className={`min-h-screen flex flex-col justify-center items-center pt-20 transition-all duration-300 ${theme.bg} ${theme.text} ${antonio.className}`}
        >
            {/* Top Navigation */}
            <div className="absolute top-4 left-4">
                <Link
                    href="/"
                    className="text-base sm:text-xl font-extrabold tracking-tight hover:underline hover:scale-105 transition-all"
                >
                    HOME
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

            <div className={containerStyle}>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        name="firstName"
                        onChange={handleChange}
                        required
                        placeholder="First Name"
                        className={`w-full p-2 rounded border-0 text-center ${theme.isDark ? 'bg-black text-white placeholder-white' : 'bg-white text-black placeholder-black'}`}
                    />
                    <input
                        name="lastName"
                        onChange={handleChange}
                        required
                        placeholder="Last Name"
                        className={`w-full p-2 rounded border-0 text-center ${theme.isDark ? 'bg-black text-white placeholder-white' : 'bg-white text-black placeholder-black'}`}
                    />
                    <input
                        name="email"
                        onChange={handleChange}
                        required
                        placeholder="Email"
                        type="email"
                        className={`w-full p-2 rounded border-0 text-center ${theme.isDark ? 'bg-black text-white placeholder-white' : 'bg-white text-black placeholder-black'}`}
                    />
                    <input
                        name="phone"
                        onChange={handleChange}
                        required
                        placeholder="Phone"
                        className={`w-full p-2 rounded border-0 text-center ${theme.isDark ? 'bg-black text-white placeholder-white' : 'bg-white text-black placeholder-black'}`}
                    />

                    <button
                        type="submit"
                        className="w-full text-center text-lg font-bold hover:underline hover:scale-105 transition"
                    >
                        Submit
                    </button>
                </form>
                <p
                    className={`text-center text-sm sm:text-base mt-2 ${status.includes('wrong') || status.toLowerCase().includes('error')
                        ? 'text-red-500'
                        : 'text-green-500'
                        }`}
                >
                    {status}
                </p>
            </div>
        </div>
    );
}
