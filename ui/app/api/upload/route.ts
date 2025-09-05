import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const toolMode = (form.get('toolMode') as string) || 'all';
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const analysisId = randomUUID();
    const originalName = file.name || 'upload.bin';
    const safeName = originalName.replace(/[^a-zA-Z0-9_.\-\[\]\(\)]+/g, '_');

    const comboRoot = path.resolve(process.cwd(), '..', 'combo-pack-advanced');
    const savedFilePath = path.join(comboRoot, `${analysisId}_${safeName}`);
    fs.writeFileSync(savedFilePath, buffer);

    const args = ['advanced_forensic_analyzer.js', path.basename(savedFilePath)];
    if (toolMode === 'exiftool') args.push('--tools=exiftool');

    const result = spawnSync('node', args, { cwd: comboRoot, encoding: 'utf8', timeout: 5 * 60 * 1000 });
    if (result.error) {
      console.error('upload: spawn error', result.error);
      return NextResponse.json({ error: 'Analyzer failed to start' }, { status: 500 });
    }
    if (result.status !== 0) {
      console.error('upload: non-zero exit', { code: result.status, stderr: result.stderr });
      return NextResponse.json({ error: 'Analyzer failed', details: result.stderr }, { status: 500 });
    }

    const baseNameNoExt = path.parse(savedFilePath).name;
    const analysisFolder = path.join(comboRoot, `analysis_${baseNameNoExt}`);
    const dataPath = path.join(analysisFolder, 'advanced_forensic_data.json');
    if (!fs.existsSync(dataPath)) return NextResponse.json({ error: 'Analysis did not produce data' }, { status: 500 });

    return NextResponse.json({ analysisId, fileName: originalName, analysisFolder: path.basename(analysisFolder), ready: true });
  } catch (e) {
    console.error('upload: unexpected', e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
