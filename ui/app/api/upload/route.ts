import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const toolMode = (form.get('toolMode') as string) || 'all';
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const analysisId = randomUUID();
    const originalName = file.name || 'upload.bin';

    // For now, return a mock response since we don't have the analyzer tools in Vercel
    // In production, this would proxy to an external analyzer service
    const mockReport = {
      fileInfo: {
        fileName: originalName,
        fileSize: file.size,
        mimeType: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      },
      hashes: {
        note: "Hashes would be calculated by external analyzer service"
      },
      toolOutputs: {
        exiftool: {
          note: `Would run ExifTool analysis (mode: ${toolMode})`,
          status: "Requires external analyzer service"
        }
      }
    };

    return NextResponse.json({ 
      analysisId, 
      fileName: originalName, 
      report: mockReport,
      assets: [],
      ready: true 
    });
  } catch (e) {
    console.error('upload: unexpected', e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
