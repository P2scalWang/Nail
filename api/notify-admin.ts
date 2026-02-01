import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendLineMessage, createAdminNotification } from './line-helper';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { booking } = req.body;
    const adminId = process.env.LINE_ADMIN_USER_ID;

    if (!booking || !adminId) {
        return res.status(400).json({ message: 'Missing booking data or Admin Login' });
    }

    try {
        const messages = createAdminNotification(booking);
        const success = await sendLineMessage(adminId, messages);

        if (success) {
            return res.status(200).json({ status: 'ok' });
        } else {
            return res.status(500).json({ status: 'error', message: 'Failed to send LINE message' });
        }
    } catch (error) {
        console.error('Notification Error:', error);
        return res.status(500).json({ status: 'error', message: String(error) });
    }
}
