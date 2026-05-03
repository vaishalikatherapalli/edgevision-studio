import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>⚡ EdgeVision Studio</span>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/inference" style={styles.link}>Inference</Link>
        <Link to="/devices" style={styles.link}>Devices</Link>
        <button onClick={logout} style={styles.logout}>Logout</button>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: { display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'12px 24px', background:'#1a1a2e', color:'white' },
  brand: { fontSize:'18px', fontWeight:'bold', color:'#00d4ff' },
  links: { display:'flex', gap:'20px', alignItems:'center' },
  link: { color:'#ccc', textDecoration:'none', fontSize:'14px' },
  logout: { background:'#e74c3c', color:'white', border:'none',
    padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px' }
};