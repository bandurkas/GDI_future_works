import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { sendMetaConversionEvent } from '@/lib/meta-ads';
import { normalizeUtm } from '@/lib/utm-normalize';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    let bodyData: any = {};
    try {
        bodyData = await req.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const {
        name, email, phone, scenario, courseTitle, courseId,
        preferredTime, utmSource, utmMedium, utmCampaign,
        gaClientId, fbClientId, fbBrowserId, waStatus
    } = bodyData;

    try {
        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        if (!phone || phone.replace(/\D/g, '').length < 8) {
            return NextResponse.json({ error: 'A valid WhatsApp/phone number is required' }, { status: 400 });
        }
        if (scenario === 'Syllabus' && !email) {
            return NextResponse.json({ error: 'Email is required to receive the syllabus' }, { status: 400 });
        }

        const utm = normalizeUtm({ utmSource, utmMedium, utmCampaign });
        const source = `Lead Magnet: ${scenario === 'Syllabus' ? 'Syllabus' : 'Consultation'} (${courseTitle || 'General'})`;
        const country = req.headers.get('cf-ipcountry') || 'XX';
        const waStatusNorm = waStatus === 'VERIFIED' || waStatus === 'BYPASSED' ? waStatus : null;

        // 1. Save to CRM
        const lead = await prisma.lead.create({
            data: {
                name,
                email: email || `lead_${phone.replace(/\D/g, '')}@noemail.gdi`,
                phone,
                type: 'STUDENT',
                status: 'NEW',
                source,
                country,
                waStatus: waStatusNorm,
                utmSource: utm.utmSource,
                utmMedium: utm.utmMedium,
                utmCampaign: utm.utmCampaign,
                gaClientId,
                fbClientId,
                fbBrowserId,
            }
        });

        // 2. Track activity
        await prisma.leadActivity.create({
            data: {
                leadId: lead.id,
                type: scenario === 'Syllabus' ? 'EMAIL' : 'WHATSAPP',
                notes: JSON.stringify({
                    action: scenario === 'Syllabus' ? 'downloaded_syllabus' : 'booked_consultation',
                    course: courseTitle,
                    preferredTime: preferredTime || null,
                    timestamp: new Date().toISOString()
                })
            }
        });

        // 3. Automation: Send Email for Syllabus
        if (scenario === 'Syllabus' && email) {
            const syllabusUrl = courseId
                ? `https://gdifuture.works/syllabus/${courseId}?print=1`
                : `https://gdifuture.works/courses`;
            sendEmail({
                to: email,
                subject: `Your Course Syllabus: ${courseTitle}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                        <h2 style="color: #ff3b30;">Hello ${name}!</h2>
                        <p>Thank you for your interest in our <strong>${courseTitle}</strong> course.</p>
                        <p>Click below to open and download the detailed syllabus as a PDF. Our advisor will also be in touch shortly to answer any questions.</p>
                        <div style="margin: 24px 0; text-align: center;">
                            <a href="${syllabusUrl}" style="display: inline-block; background: #ef4444; color: #fff; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none;">📄 Download Syllabus (PDF)</a>
                        </div>
                        <div style="margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                            <h3 style="margin-top: 0;">What's next?</h3>
                            <ul style="padding-left: 20px;">
                                <li>Review the syllabus.</li>
                                <li>Prepare your questions for the free consultation.</li>
                                <li>Check out our <a href="https://gdifuture.works/courses">other courses</a>.</li>
                            </ul>
                        </div>
                        <p>Ready to start faster? <a href="https://api.whatsapp.com/send/?phone=628211704707" style="color: #16a34a; font-weight: bold;">Chat with us on WhatsApp</a>.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                        <p style="font-size: 12px; color: #888;">GDI FutureWorks — Accelerating Tech Careers in SE Asia</p>
                    </div>
                `
            }).catch(e => console.error('Auto-email failed', e));
        }

        // 4. Meta CAPI Notification (Server Side)
        sendMetaConversionEvent({
            eventName: 'Lead',
            userData: {
                email: email,
                phone: phone,
                fbc: fbClientId,
                fbp: fbBrowserId,
                clientIpAddress: req.headers.get('x-forwarded-for') || undefined,
                clientUserAgent: req.headers.get('user-agent') || undefined
            },
            customData: {
                content_name: courseTitle,
                content_category: 'Courses',
                value: 0,
                currency: 'USD'
            },
            sourceUrl: req.headers.get('referer') || undefined
        }).catch(e => console.error('Meta CAPI failed', e));

        return NextResponse.json({ ok: true, leadId: lead.id });

    } catch (error) {
        console.error('Lead capture error:', error);
        
        // Resilience: Fallback to file logging if DB is unreachable
        try {
            const logDir = path.join(process.cwd(), 'logs');
            if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
            
            const logFile = path.join(logDir, 'failed-leads.jsonl');
            const logEntry = JSON.stringify({
                timestamp: new Date().toISOString(),
                context: 'Manual Lead Magnet Capture',
                error: (error as Error).message,
                data: bodyData
            });
            
            fs.appendFileSync(logFile, logEntry + '\n');
            console.log('Lead preserved in fallback store (failed-leads.jsonl)');
            
            return NextResponse.json({ ok: true, fallback: true }, { status: 202 });
        } catch (logError) {
            return NextResponse.json({ ok: false, error: 'Double failure' }, { status: 500 });
        }
    }
}
