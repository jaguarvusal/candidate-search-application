import { Link } from 'react-router-dom';

const Nav = () => {
  return (
    <nav className="navbar" style={{ 
      padding: '0.5rem', // Reduced from 1rem
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000
    }}>
      <ul className="nav-list" style={{ 
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        listStyle: 'none',
        padding: 0,
        margin: 0
      }}>
        <li className="nav-item" style={{ marginRight: '2rem' }}>
          <Link to="/" className="nav-link" style={{ color: 'white', fontWeight: 'bold' }}>Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/SavedCandidates" className="nav-link" style={{ color: 'white', fontWeight: 'bold' }}>Potential Candidates</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
