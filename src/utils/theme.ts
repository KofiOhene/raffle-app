// src/utils/theme.ts
export function getRandomTheme() {
    const themes = [
        {
            bg: 'bg-white',
            text: 'text-black',
            isDark: false,
        },
        {
            bg: 'bg-black',
            text: 'text-white',
            isDark: true,
        },
    ];

    return themes[Math.floor(Math.random() * themes.length)];
}
