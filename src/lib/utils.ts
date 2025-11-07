export const backgrounds = [
    'bg-gradient-to-r from-purple-800 to-indigo-700',
    'bg-gradient-to-r from-yellow-600 to-red-500',
    'bg-gradient-to-r from-green-700 to-blue-500',
    'bg-gradient-to-r from-pink-600 to-rose-500',
    'bg-gradient-to-r from-gray-700 to-gray-900',
];

export function getRandomBackground() {
    const index = Math.floor(Math.random() * backgrounds.length);
    return backgrounds[index];
}
