import { NextResponse } from 'next/server';
import { syncMetaAdsPerformance } from '@/lib/meta-ads';
import { auth } from '@/auth';

export async function POST() {
  const session = await auth();
  
  if (!session || (session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'OWNER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await syncMetaAdsPerformance(30); // Sync last 30 days
    return NextResponse.json({ 
      success: true, 
      count: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Meta Sync Error:', error);
    return NextResponse.json({ 
      error: 'Sync failed', 
      message: error.message 
    }, { status: 500 });
  }
}
