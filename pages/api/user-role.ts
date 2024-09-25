'use client';
import { createClient, OAuthStrategy } from "@wix/sdk";
import { currentMember } from "@wix/site-members";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('Received request with cookies:', req.cookies);

    const wixSessionCookie = req.cookies['wix-session'];
    if (!wixSessionCookie) {
        return res.status(400).json({ error: 'Missing wix-session cookie' });
    }

    let token = JSON.parse(wixSessionCookie).accessToken;
    try {
        if (!token) {
            throw new Error('Access token is missing');
        }
    } catch (error) {
        console.error('Invalid token format:', error);
        return res.status(400).json({ error: 'Invalid token format' });
    }

    const clientId = process.env.NEXT_PUBLIC_WIX_CLIENT_ID;
    if (!clientId) {
        return res.status(500).json({ error: 'Client ID not configured' });
    }

    const wixClient = createClient({
        modules: { currentMember },
        auth: OAuthStrategy({
            clientId,
            tokens: token, 
        }),
    });

    try {
        const roles = await wixClient.currentMember.getRoles();
        return res.status(200).json({ roles });
    } catch (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({ error: 'Failed to get roles' });
    }
}
