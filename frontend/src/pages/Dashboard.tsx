import { useEffect, useState } from 'react';
import { getMe, getHistory, getDevices } from '../services/api';
import Navbar from '../components/Navbar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    getMe().then(r => setUser(r.data));
    getHistory().then(r => setHistory(r.data));
    getDevices().then(r => setDevices(r.data));
  }, []);

  // Count detected objects across all inferences
  const objectCounts: Record<string, number> = {};
  history.forEach(h => {
    h.detections.forEach((d: any) => {
      objectCounts[d.label] = (objectCounts[d.label] || 0) + 1;
    });
  });
  const chartData = Object.entries(objectCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const deviceStatusData = [
    { name: 'Online', value: devices.filter(d => d.status === 'online').length },
    { name: 'Offline', value: devices.filter(d => d.status === 'offline').length },
  ];

  const COLORS = ['#00d4ff', '#e74c3c'];

  return (
    <div style={{ background:'#0f0f23', minHeight:'100vh', color:'white' }}>
      <Navbar />
      <div style={{ padding:'30px' }}>
        <h2 style={{ color:'#00d4ff' }}>Welcome, {user?.full_name} 👋</h2>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'30px' }}>
          {[
            { label:'Total Inferences', value: history.length, color:'#00d4ff' },
            { label:'Devices Registered', value: devices.length, color:'#2ecc71' },
            { label:'Objects Detected', value: history.reduce((a,h) => a + h.detections.length, 0), color:'#f39c12' },
          ].map(stat => (
            <div key={stat.label} style={{ background:'#1a1a2e', padding:'20px',
              borderRadius:'12px', borderLeft:`4px solid ${stat.color}` }}>
              <div style={{ fontSize:'28px', fontWeight:'bold', color: stat.color }}>{stat.value}</div>
              <div style={{ color:'#888', fontSize:'13px', marginTop:'4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'16px' }}>
          <div style={{ background:'#1a1a2e', padding:'20px', borderRadius:'12px' }}>
            <h3 style={{ color:'#ccc', marginTop:0 }}>Top Detected Objects</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <XAxis dataKey="label" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip contentStyle={{ background:'#1a1a2e', border:'1px solid #333' }} />
                  <Bar dataKey="count" fill="#00d4ff" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color:'#555' }}>Run some inferences to see data here</p>
            )}
          </div>
          <div style={{ background:'#1a1a2e', padding:'20px', borderRadius:'12px' }}>
            <h3 style={{ color:'#ccc', marginTop:0 }}>Device Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={deviceStatusData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={70} label>
                  {deviceStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background:'#1a1a2e', border:'1px solid #333' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent inferences */}
        <div style={{ background:'#1a1a2e', padding:'20px', borderRadius:'12px', marginTop:'16px' }}>
          <h3 style={{ color:'#ccc', marginTop:0 }}>Recent Inferences</h3>
          {history.length === 0 ? <p style={{ color:'#555' }}>No inferences yet</p> : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr style={{ color:'#888' }}>
                  <th style={th}>File</th><th style={th}>Objects</th>
                  <th style={th}>Latency</th><th style={th}>Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id} style={{ borderTop:'1px solid #222' }}>
                    <td style={td}>{h.filename}</td>
                    <td style={td}>{h.detections.map((d:any) => `${d.label} ${d.confidence}%`).join(', ')}</td>
                    <td style={td}>{h.inference_time_ms}ms</td>
                    <td style={td}>{new Date(h.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign:'left', padding:'8px', fontWeight:500 };
const td: React.CSSProperties = { padding:'10px 8px', color:'#ccc' };