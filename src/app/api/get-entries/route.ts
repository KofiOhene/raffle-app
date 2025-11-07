import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    const client = await clientPromise;
    const db = client.db('afterpiece_raffle');
    const entries = await db.collection('entries').find().toArray();

    return NextResponse.json({ entries });
}
