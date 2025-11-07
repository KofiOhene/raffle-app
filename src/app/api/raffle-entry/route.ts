import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import clientPromise from '@/lib/mongodb';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { firstName, lastName, email, phone } = await req.json();

        // Normalize phone by stripping non-digit characters
        const normalizedPhone = phone.replace(/\D/g, ''); // e.g. "732-543-6711" => "7325436711"

        // Generate unique raffle ID
        const raffleId = 'RAFFLE-' + uuidv4().split('-')[0].toUpperCase();

        const client = await clientPromise;
        const db = client.db('afterpiece_raffle');

        // Check for existing entry with same email OR same phone number
        const existingEntry = await db.collection('entries').findOne({
            $or: [
                { email },
                { phone: normalizedPhone }
            ]
        });

        if (existingEntry) {
            return NextResponse.json(
                { error: 'You have already entered the raffle with this email or phone number.' },
                { status: 400 }
            );
        }

        // Save entry
        await db.collection('entries').insertOne({
            firstName,
            lastName,
            email,
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

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'You’re in! Afterpiece Raffle Entry Confirmation',
            text: `Hey ${firstName},\n\nThanks for entering the raffle!\n\nYour unique raffle ID: ${raffleId}\n\nGood luck!\n– Afterpiece Team`,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Raffle Entry Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
