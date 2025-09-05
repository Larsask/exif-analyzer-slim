import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: { id: string; asset: string } }): Promise<Response> {
  try {
    const id = decodeURIComponent(params.id);
    const asset = decodeURIComponent(params.asset);
    
    // For now, return a mock response since we don't have the analyzer tools in Vercel
    // In production, this would proxy to an external analyzer service
    return NextResponse.json({ 
      error: 'Asset download not available in demo mode',
      note: 'In production, this would serve files from the external analyzer service',
      id,
      asset
    }, { status: 404 });
  } catch (e) {
    console.error('download: unexpected', e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
