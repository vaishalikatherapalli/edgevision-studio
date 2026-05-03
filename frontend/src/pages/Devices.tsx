import { useEffect, useState, useRef } from 'react';
import { getDevices, registerDevice, deleteDevice } from '../services/api';
import Navbar from '../components/Navbar';

export default function Devices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [liveDevices, setLiveDevices] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('MPU');
  const [error, setError] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  const fetchDevices = () => getDevices().then(r => setDevices(r.data));

  useEffect(() => {
    fetchDevices();

    // Connect to WebSocket for real-time telemetry
    const ws = new WebSocket('ws://localhost:8000/devices/ws');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'telemetry') setLiveDevices(data.devices);
    };

    ws.onerror = () => console.log('WebSocket error');

    return () => ws.close();
  }, []);

  const handleRegister = async () => {
    if (!name.trim()) { setError('Device name required'); return; }
    try {
      await registerDevice(name, type);
      setName('');
      setError('');
      fetchDevices();
    } catch {
      setError('Failed to register device');
    }
  };

  const handleDelete = async (id: number) => {
    await deleteDevice(id);
    fetchDevices();
  };

  // Merge DB devices with live telemetry
  const mergedDevices = devices.map(d => {
    const live = liveDevices.find(l => l.id === d.id);
    return live || d;
  });

  const deviceTypeColor: Record<string, string> = {
    MCU: '#e74c3c', MPU: '#f39c12', NPU: '#2ecc71'
  };

  return (
    <div style={{ background:'#0f0f23', minHeight:'100vh', color:'white' }}>
      <Navbar />
      <div style={{ padding:'30px' }}>
        <h2 style={{ color:'#00d4ff' }}>🖥 Edge Device Fleet</h2>

        {/* Register form */}
        <div style={{ background:'#1a1a2e', padding:'20px', borderRadius:'12px', marginBottom:'24px' }}>
          <h3 style={{ color:'#ccc', marginTop:0 }}>Register New Device</h3>
          {error && <div style={{ color:'#e74c3c', fontSize:'13px', marginBottom:'10px' }}>{error}</div>}
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Device name (e.g. Factory-Cam-01)"
              style={{ flex:1, padding:'10px 14px', borderRadius:'8px', border:'1px solid #333',
                background:'#0f0f23', color:'white', fontSize:'14px', minWidth:'200px' }} />
            <select value={type} onChange={e => setType(e.target.value)}
              style={{ padding:'10px 14px', borderRadius:'8px', border:'1px solid #333',
                background:'#0f0f23', color:'white', fontSize:'14px' }}>
              <option value="MCU">MCU — Microcontroller</option>
              <option value="MPU">MPU — Microprocessor</option>
              <option value="NPU">NPU — Neural Processing Unit</option>
            </select>
            <button onClick={handleRegister}
              style={{ padding:'10px 20px', background:'#00d4ff', color:'#0f0f23',
                border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' }}>
              + Register
            </button>
          </div>
        </div>

        {/* Device grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'16px' }}>
          {mergedDevices.map(device => (
            <div key={device.id} style={{ background:'#1a1a2e', borderRadius:'12px',
              padding:'20px', borderLeft:`4px solid ${deviceTypeColor[device.device_type] || '#00d4ff'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                <span style={{ fontWeight:'bold', fontSize:'15px' }}>{device.name}</span>
                <span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'20px',
                  background: device.status === 'online' ? '#2ecc7122' : '#e74c3c22',
                  color: device.status === 'online' ? '#2ecc71' : '#e74c3c' }}>
                  {device.status === 'online' ? '● online' : '○ offline'}
                </span>
              </div>
              <div style={{ fontSize:'12px', color:'#888', display:'flex', flexDirection:'column', gap:'4px' }}>
                <span>Type: <span style={{ color: deviceTypeColor[device.device_type] }}>{device.device_type}</span></span>
                <span>Inference: <span style={{ color:'#fff' }}>{device.last_inference_ms}ms</span></span>
                <span>Model: <span style={{ color:'#fff' }}>{device.model_version}</span></span>
              </div>
              <button onClick={() => handleDelete(device.id)}
                style={{ marginTop:'14px', width:'100%', padding:'7px', background:'transparent',
                  border:'1px solid #e74c3c33', color:'#e74c3c', borderRadius:'6px',
                  cursor:'pointer', fontSize:'12px' }}>
                Remove Device
              </button>
            </div>
          ))}
        </div>

        {mergedDevices.length === 0 && (
          <p style={{ color:'#555', textAlign:'center', marginTop:'40px' }}>
            No devices registered yet. Add one above.
          </p>
        )}
      </div>
    </div>
  );
}