const LINE_API_URL = 'https://api.line.me/v2/bot/message/push';

interface BookingDetails {
    customerName: string;
    date: string;
    time: string;
    services: string[];
    price?: string; // Optional
}

export const sendLineMessage = async (to: string, messages: any[]) => {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) {
        console.error('LINE_CHANNEL_ACCESS_TOKEN is not set');
        return false;
    }

    try {
        const response = await fetch(LINE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                to,
                messages
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('LINE API Error:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Fetch Error:', error);
        return false;
    }
};

export const createAdminNotification = (booking: BookingDetails) => {
    return [
        {
            "type": "flex",
            "altText": "💅 มีการจองคิวใหม่!",
            "contents": {
                "type": "bubble",
                "header": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "NEW BOOKING",
                            "weight": "bold",
                            "color": "#FFFFFF",
                            "size": "xs"
                        },
                        {
                            "type": "text",
                            "text": "มีการจองคิวใหม่",
                            "weight": "bold",
                            "size": "xl",
                            "color": "#FFFFFF",
                            "margin": "sm"
                        }
                    ],
                    "backgroundColor": "#EC4899", // Rose-500
                    "paddingAll": "20px"
                },
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "ลูกค้า",
                                    "size": "xs",
                                    "color": "#888888"
                                },
                                {
                                    "type": "text",
                                    "text": booking.customerName,
                                    "size": "lg",
                                    "weight": "bold",
                                    "color": "#333333"
                                }
                            ],
                            "margin": "md"
                        },
                        {
                            "type": "separator",
                            "margin": "lg"
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "วันที่",
                                            "size": "xs",
                                            "color": "#888888"
                                        },
                                        {
                                            "type": "text",
                                            "text": new Date(booking.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
                                            "size": "md",
                                            "weight": "bold"
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "เวลา",
                                            "size": "xs",
                                            "color": "#888888"
                                        },
                                        {
                                            "type": "text",
                                            "text": booking.time,
                                            "size": "md",
                                            "weight": "bold",
                                            "color": "#EC4899"
                                        }
                                    ]
                                }
                            ],
                            "margin": "lg"
                        },
                        {
                            "type": "separator",
                            "margin": "lg"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "บริการ",
                                    "size": "xs",
                                    "color": "#888888",
                                    "margin": "md"
                                },
                                ...booking.services.map(service => ({
                                    "type": "text",
                                    "text": `• ${service}`,
                                    "size": "sm",
                                    "color": "#555555",
                                    "margin": "xs",
                                    "wrap": true
                                }))
                            ]
                        }
                    ]
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "uri",
                                "label": "จัดการการจอง",
                                "uri": "https://nail-lilac.vercel.app/nailnan-manage-x7k9p.html"
                            },
                            "style": "primary",
                            "color": "#EC4899"
                        }
                    ]
                }
            }
        }
    ];
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        }
    ];
};
