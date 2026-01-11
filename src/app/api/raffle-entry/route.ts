import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import clientPromise from '@/lib/mongodb';
import nodemailer from 'nodemailer';
import { raffleEntrySchema, sanitizeForDisplay } from '@/lib/validation';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(req: Request) {
    try {
        // Rate limiting - 5 attempts per minute per IP
        const clientId = getClientIdentifier(req);
        const rateLimit = checkRateLimit(`raffle-entry:${clientId}`, {
            windowMs: 60000,
            maxRequests: 5,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
                    },
                }
            );
        }

        // Parse and validate input
        const body = await req.json();
        const validationResult = raffleEntrySchema.safeParse(body);

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(e => e.message).join(', ');
            return NextResponse.json(
                { error: errors },
                { status: 400 }
            );
        }

        const { firstName, lastName, email, phone } = validationResult.data;

        // Normalize phone by stripping non-digit characters
        const normalizedPhone = phone.replace(/\D/g, '');

        // Generate secure unique raffle ID using full UUID
        const raffleId = 'RAFFLE-' + randomUUID().replace(/-/g, '').toUpperCase();

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DATABASE || 'afterpiece_raffle');

        // Check for existing entry with same email OR same phone number
        const existingEntry = await db.collection('entries').findOne({
            $or: [
                { email: email.toLowerCase() },
                { phone: normalizedPhone }
            ]
        });

        if (existingEntry) {
            return NextResponse.json(
                { error: 'You have already entered the raffle with this email or phone number.' },
                { status: 400 }
            );
        }

        // Save entry with sanitized data
        await db.collection('entries').insertOne({
            firstName: sanitizeForDisplay(firstName),
            lastName: sanitizeForDisplay(lastName),
            email: email.toLowerCase(),
            phone: normalizedPhone,
            raffleId,
            createdAt: new Date(),
        });

        // Send confirmation email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Sanitize name for email to prevent header injection
        const safeName = sanitizeForDisplay(firstName).substring(0, 50);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "You're in! Afterpiece Raffle Entry Confirmation",
            text: `Hey ${safeName},\n\nThanks for entering the raffle!\n\nYour unique raffle ID: ${raffleId}\n\nGood luck!\n– Afterpiece Team`,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Raffle Entry Error:', err instanceof Error ? err.message : 'Unknown error');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
