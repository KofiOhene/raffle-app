import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import nodemailer from 'nodemailer';
import { verifyAdminAuth } from '@/lib/auth';
import { winnerIdSchema, sanitizeForDisplay } from '@/lib/validation';

export async function POST(req: Request) {
    try {
        // Verify admin authentication
        const authResult = verifyAdminAuth(req);
        if (!authResult.authorized) {
            return authResult.response;
        }

        // Parse and validate input
        const body = await req.json();
        const validationResult = winnerIdSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid winner ID format' },
                { status: 400 }
            );
        }

        const { winnerId } = validationResult.data;

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DATABASE || 'afterpiece_raffle');
        const allEntries = await db.collection('entries').find().toArray();

        const winnerEntry = allEntries.find((entry) => entry.raffleId === winnerId);

        if (!winnerEntry) {
            return NextResponse.json({ error: 'Winner not found' }, { status: 404 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Sanitize winner name for email
        const winnerName = sanitizeForDisplay(String(winnerEntry.firstName)).substring(0, 50);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: winnerEntry.email,
            subject: 'You Won the Afterpiece Raffle!',
            text: `Congratulations ${winnerName}!\n\nYou won the raffle!\n\nYour raffle ID: ${winnerEntry.raffleId}`,
        });

        const losers = allEntries.filter((entry) => entry.raffleId !== winnerId);

        // Send loser emails with error handling for individual emails
        const emailErrors: string[] = [];
        for (const loser of losers) {
            try {
                const loserName = sanitizeForDisplay(String(loser.firstName)).substring(0, 50);
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: loser.email,
                    subject: 'Afterpiece Raffle Result',
                    text: `Hey ${loserName},\n\nThanks for entering the raffle! This time you didn't win, but stay tuned for the next drop!`,
                });
            } catch (emailErr) {
                emailErrors.push(loser.email);
                console.error(`Failed to send email to ${loser.email}:`, emailErr instanceof Error ? emailErr.message : 'Unknown error');
            }
        }

        if (emailErrors.length > 0) {
            return NextResponse.json({
                message: 'Winner processed but some notification emails failed',
                failedEmails: emailErrors.length,
            });
        }

        return NextResponse.json({ message: 'Winner processed and emails sent' });
    } catch (err) {
        console.error('Process Winner Error:', err instanceof Error ? err.message : 'Unknown error');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
