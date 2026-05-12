// Componente raiz: estructura comun y enrutado de la SPA
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { AppRouter } from './routes/AppRouter.jsx';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="app__contenido">
        <AppRouter />
      </main>
      <Footer />
    </div>
  );
}
