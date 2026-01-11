import { NextResponse } from 'next/server';

// Verify admin API key from request headers
export function verifyAdminAuth(req: Request): { authorized: boolean; response?: NextResponse } {
    const authHeader = req.headers.get('Authorization');
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey) {
        console.error('ADMIN_API_KEY environment variable is not set');
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            ),
        };
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Unauthorized - Missing or invalid authorization header' },
                { status: 401 }
            ),
        };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (token !== adminKey) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Unauthorized - Invalid API key' },
                { status: 401 }
            ),
        };
    }

    return { authorized: true };
}
