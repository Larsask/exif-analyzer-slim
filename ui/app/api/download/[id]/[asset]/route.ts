import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: { id: string; asset: string } }): Promise<Response> {
  try {
    const id = decodeURIComponent(params.id);
    const asset = decodeURIComponent(params.asset);
    const comboRoot = path.resolve(process.cwd(), '..', 'combo-pack-advanced');
    const entries = fs.readdirSync(comboRoot);
    const baseFile = entries.find((e) => e.startsWith(`${id}_`));
    if (!baseFile) return new Response('Not found', { status: 404 });
    const analysisFolder = path.join(comboRoot, `analysis_${path.parse(baseFile).name}`);
    const filePath = path.join(analysisFolder, asset);
    if (!fs.existsSync(filePath)) return new Response('Not found', { status: 404 });
    const data = fs.readFileSync(filePath);
    return new Response(data, { status: 200 });
  } catch (e) {
    console.error('download: unexpected', e);
    return new Response('Unexpected error', { status: 500 });
  }
}
