import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const id = decodeURIComponent(params.id);
    const comboRoot = path.resolve(process.cwd(), '..', 'combo-pack-advanced');
    const folderGlobPrefix = `${id}_`;
    // Find matching analysis folder by prefix
    const entries = fs.readdirSync(comboRoot);
    const baseFile = entries.find((e) => e.startsWith(folderGlobPrefix));
    if (!baseFile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const analysisFolder = path.join(comboRoot, `analysis_${path.parse(baseFile).name}`);
    const dataPath = path.join(analysisFolder, 'advanced_forensic_data.json');
    if (!fs.existsSync(dataPath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const report = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const assets = fs.readdirSync(analysisFolder).filter((f) => f !== 'advanced_forensic_data.json');
    return NextResponse.json({ id, folder: path.basename(analysisFolder), report, assets });
  } catch (e) {
    console.error('report: unexpected', e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
