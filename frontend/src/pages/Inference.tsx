import { useState, useRef } from 'react';
import { detectObjects } from '../services/api';
import Navbar from '../components/Navbar';

export default function Inference() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError('');
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleDetect = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const res = await detectObjects(file);
      setResult(res.data);
    } catch {
      setError('Detection failed. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const confidenceColor = (c: number) =>
    c >= 80 ? '#2ecc71' : c >= 60 ? '#f39c12' : '#e74c3c';

  return (
    <div style={{ background:'#0f0f23', minHeight:'100vh', color:'white' }}>
      <Navbar />
      <div style={{ padding:'30px', maxWidth:'800px', margin:'0 auto' }}>
        <h2 style={{ color:'#00d4ff' }}>🔍 Object Detection</h2>
        <p style={{ color:'#888' }}>Upload an image and run real AI inference using YOLOv8 ONNX model</p>

        {/* Upload area */}
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={e => e.preventDefault()}
          style={{ border:'2px dashed #333', borderRadius:'12px', padding:'40px',
            textAlign:'center', cursor:'pointer', marginBottom:'20px',
            background: preview ? '#0f0f23' : '#1a1a2e',
            transition:'border-color 0.2s' }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ maxWidth:'100%', maxHeight:'300px', borderRadius:'8px' }} />
          ) : (
            <>
              <div style={{ fontSize:'40px', marginBottom:'10px' }}>📁</div>
              <div style={{ color:'#888' }}>Drop an image here or click to upload</div>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" style={{ display:'none' }}
            onChange={e => e.target.files && handleFile(e.target.files[0])} />
        </div>

        {file && (
          <button onClick={handleDetect} disabled={loading}
            style={{ width:'100%', padding:'14px', background:'#00d4ff', color:'#0f0f23',
              border:'none', borderRadius:'8px', fontWeight:'bold', fontSize:'15px', cursor:'pointer' }}>
            {loading ? '⏳ Running inference...' : '🚀 Detect Objects'}
          </button>
        )}

        {error && <div style={{ background:'#e74c3c22', color:'#e74c3c',
          padding:'12px', borderRadius:'8px', marginTop:'16px' }}>{error}</div>}

        {result && (
          <div style={{ background:'#1a1a2e', borderRadius:'12px', padding:'24px', marginTop:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
              <h3 style={{ margin:0, color:'#00d4ff' }}>Results</h3>
              <span style={{ color:'#888', fontSize:'13px' }}>⏱ {result.inference_time_ms}ms inference time</span>
            </div>

            {result.detections.length === 0 ? (
              <p style={{ color:'#888' }}>No objects detected above 50% confidence</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {result.detections.map((d: any, i: number) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ color:'white', width:'120px', fontSize:'14px' }}>{d.label}</span>
                    <div style={{ flex:1, background:'#0f0f23', borderRadius:'20px', height:'20px', overflow:'hidden' }}>
                      <div style={{ width:`${d.confidence}%`, height:'100%',
                        background: confidenceColor(d.confidence), borderRadius:'20px',
                        transition:'width 0.5s ease' }} />
                    </div>
                    <span style={{ color: confidenceColor(d.confidence),
                      fontWeight:'bold', fontSize:'14px', width:'50px' }}>
                      {d.confidence}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop:'16px', padding:'12px', background:'#0f0f23',
              borderRadius:'8px', fontSize:'12px', color:'#555' }}>
              Model: YOLOv8n ONNX · File: {result.filename} · Objects found: {result.total_objects}
            </div>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display:'none' }} />
      </div>
    </div>
  );
}