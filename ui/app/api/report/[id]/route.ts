import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const id = decodeURIComponent(params.id);
    
    // For now, return a mock response since we don't have the analyzer tools in Vercel
    // In production, this would proxy to an external analyzer service
    const mockData = {
      id,
      folder: `analysis_${id}`,
      report: {
        fileInfo: {
          fileName: "sample.jpg",
          fileSize: 1024000,
          mimeType: "image/jpeg",
          lastModified: new Date().toISOString()
        },
        hashes: {
          note: "Hashes would be calculated by external analyzer service"
        },
        toolOutputs: {
          exiftool: {
            note: "Would run ExifTool analysis",
            status: "Requires external analyzer service"
          }
        }
      },
      assets: []
    };

    return NextResponse.json(mockData);
  } catch (e) {
    console.error('report: unexpected', e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
