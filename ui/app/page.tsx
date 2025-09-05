"use client";
import React from 'react';

export default function Page() {
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [id, setId] = React.useState<string | null>(null);
  const [report, setReport] = React.useState<any | null>(null);
  const [toolMode, setToolMode] = React.useState<'all' | 'exiftool'>('all');

  async function onUpload() {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('toolMode', toolMode);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Upload failed');
      setId(json.analysisId);
      const rep = await fetch(`/api/report/${encodeURIComponent(json.analysisId)}`);
      const repJson = await rep.json();
      setReport(repJson);
    } catch (e) {
      console.error('upload failed:', e);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  }

  function Section({ title, data }: { title: string; data?: Record<string, unknown> }) {
    return (
      <div className="card" style={{ marginTop: 12 }}>
        <div className="header">{title}</div>
        {!data || Object.keys(data).length === 0 ? (
          <div className="nodata">No data</div>
        ) : (
          <div className="grid">
            <div className="label">Field</div>
            <div className="label">Value</div>
            <div className="label">Explanation</div>
            {Object.entries(data).map(([k, v]) => (
              <React.Fragment key={k}>
                <div className="cell" style={{ wordBreak: 'break-all' }}>{k}</div>
                <div className="cell" style={{ wordBreak: 'break-all' }}>{typeof v === 'string' ? v : JSON.stringify(v)}</div>
                <div className="cell label">—</div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">Upload image for forensic analysis</div>
        <div className="row">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <label className="row" style={{ gap: 6 }}>
            <input type="radio" name="toolMode" value="all" checked={toolMode === 'all'} onChange={() => setToolMode('all')} />
            <span>All tools</span>
          </label>
          <label className="row" style={{ gap: 6 }}>
            <input type="radio" name="toolMode" value="exiftool" checked={toolMode === 'exiftool'} onChange={() => setToolMode('exiftool')} />
            <span>ExifTool only</span>
          </label>
          <button onClick={onUpload} disabled={!file || loading} className="tab">{loading ? 'Analyzing…' : 'Analyze'}</button>
        </div>
      </div>

      {report && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="header">Results</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(report.assets || []).map((a: string) => (
              <a key={a} className="link" href={`/api/download/${encodeURIComponent(id || '')}/${encodeURIComponent(a)}`}>{a}</a>
            ))}
          </div>
          <Section title="File Info" data={report.report?.fileInfo} />
          <Section title="Hashes" data={report.report?.hashes} />
          <Section title="File Structure" data={report.report?.fileStructure} />
          <Section title="Compression" data={report.report?.compressionAnalysis} />
          <Section title="Metadata Integrity" data={report.report?.metadataIntegrity} />
          <Section title="Binary Analysis" data={report.report?.binaryAnalysis} />
          <Section title="GPS Analysis" data={report.report?.gpsAnalysis} />
          <Section title="ExifTool" data={report.report?.toolOutputs?.exiftool as Record<string, unknown>} />
          <Section title="ImageMagick" data={report.report?.toolOutputs?.imagemagick as Record<string, unknown>} />
          <Section title="jhead" data={report.report?.toolOutputs?.jhead as Record<string, unknown>} />
          <Section title="exiv2" data={report.report?.toolOutputs?.exiv2 as Record<string, unknown>} />
        </div>
      )}
    </div>
  );
}
