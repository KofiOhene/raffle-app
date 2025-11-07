import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    const { winnerId } = await req.json();

    const client = await clientPromise;
    const db = client.db('afterpiece_raffle');
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

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: winnerEntry.email,
        subject: 'You Won the Afterpiece Raffle!',
        text: `Congratulations ${winnerEntry.firstName}!\n\nYou won the raffle!\n\nYour raffle ID: ${winnerEntry.raffleId}`,
    });

    const losers = allEntries.filter((entry) => entry.raffleId !== winnerId);
    for (const loser of losers) {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: loser.email,
            subject: 'Afterpiece Raffle Result',
            text: `Hey ${loser.firstName},\n\nThanks for entering the raffle! This time you didn’t win, but stay tuned for the next drop!`,
        });
    }

    return NextResponse.json({ message: 'Winner processed and emails sent' });
}
