import './styles/global.css';
import { HashRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppRoutes from './routes';

function App() {
  return (
    <GoogleOAuthProvider clientId="767450657361-c1arvbqpisqt92qpcf4596gkc6rsqbij.apps.googleusercontent.com">
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
