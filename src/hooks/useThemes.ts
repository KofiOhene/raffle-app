import { useEffect, useState } from 'react';

type Theme = {
    mode: 'light' | 'dark';
    bg: string;
    text: string;
};

const themes: Theme[] = [
    { mode: 'light', bg: 'bg-white', text: 'text-black' },
    { mode: 'dark', bg: 'bg-black', text: 'text-white' },
];

export const useTheme = (): Theme => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * themes.length);
        setIndex(randomIndex);
    }, []);

    return themes[index];
};
