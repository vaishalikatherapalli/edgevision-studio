import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      sessionStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>⚡ EdgeVision Studio</h2>
        <p style={styles.sub}>Sign in to your account</p>
        {error && <div style={styles.error}>{error}</div>}
        <input style={styles.input} placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} placeholder="Password" type="password"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <button style={styles.btn} onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p style={styles.footer}>No account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center',
    justifyContent:'center', background:'#0f0f23' },
  card: { background:'#1a1a2e', padding:'40px', borderRadius:'12px',
    width:'360px', display:'flex', flexDirection:'column', gap:'14px' },
  title: { color:'#00d4ff', margin:0, textAlign:'center' },
  sub: { color:'#888', margin:0, textAlign:'center', fontSize:'14px' },
  input: { padding:'10px 14px', borderRadius:'8px', border:'1px solid #333',
    background:'#0f0f23', color:'white', fontSize:'14px' },
  btn: { padding:'12px', borderRadius:'8px', background:'#00d4ff',
    color:'#0f0f23', border:'none', fontWeight:'bold', cursor:'pointer', fontSize:'15px' },
  error: { background:'#e74c3c22', color:'#e74c3c', padding:'10px',
    borderRadius:'8px', fontSize:'13px' },
  footer: { color:'#888', textAlign:'center', fontSize:'13px', margin:0 }
};