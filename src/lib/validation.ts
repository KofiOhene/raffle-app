import { z } from 'zod';

// Raffle entry validation schema
export const raffleEntrySchema = z.object({
    firstName: z
        .string()
        .min(1, 'First name is required')
        .max(50, 'First name must be 50 characters or less')
        .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
    lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be 50 characters or less')
        .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
    email: z
        .string()
        .email('Invalid email address')
        .max(254, 'Email must be 254 characters or less'),
    phone: z
        .string()
        .min(10, 'Phone number must be at least 10 digits')
        .max(20, 'Phone number is too long')
        .regex(/^[\d\s\-().+]+$/, 'Phone number contains invalid characters'),
});

// Winner ID validation schema
export const winnerIdSchema = z.object({
    winnerId: z
        .string()
        .regex(/^RAFFLE-[A-Z0-9]{32}$/, 'Invalid raffle ID format'),
});

// Sanitize string for safe display (removes potential XSS)
export function sanitizeForDisplay(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

export type RaffleEntryInput = z.infer<typeof raffleEntrySchema>;
export type WinnerIdInput = z.infer<typeof winnerIdSchema>;
