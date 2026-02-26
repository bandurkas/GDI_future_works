import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, name, price, customerName, customerPhone } = body;

        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const authString = Buffer.from(serverKey + ':').toString('base64');

        const response = await fetch('https://app.midtrans.com/snap/v1/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${authString}`,
            },
            body: JSON.stringify({
                transaction_details: {
                    order_id: `GDI-${id}-${Date.now()}`,
                    gross_amount: price,
                },
                item_details: [{
                    id: id,
                    price: price,
                    quantity: 1,
                    name: name.substring(0, 50) // Midtrans max length is 50
                }],
                customer_details: {
                    first_name: customerName || 'Student',
                    phone: customerPhone || ''
                }
            }),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Midtrans API Error:', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}
