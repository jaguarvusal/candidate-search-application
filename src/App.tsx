import { Outlet } from 'react-router-dom';
import Nav from './components/Nav';

function App() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <main style={{ 
        paddingTop: '1rem', // Reduced from 2rem to 1rem
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default App;
