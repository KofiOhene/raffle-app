import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyAdminAuth } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        // Verify admin authentication
        const authResult = verifyAdminAuth(req);
        if (!authResult.authorized) {
            return authResult.response;
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DATABASE || 'afterpiece_raffle');
        const entries = await db.collection('entries').find().toArray();

        return NextResponse.json({ entries });
    } catch (err) {
        console.error('Get Entries Error:', err instanceof Error ? err.message : 'Unknown error');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
