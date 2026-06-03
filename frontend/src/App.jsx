// Componente raiz: estructura comun y enrutado de la SPA
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { LanguageToggle } from './components/ui/LanguageToggle.jsx';
import { AppRouter } from './routes/AppRouter.jsx';
import './App.css';

export default function App() {
  return (
    <div className="app">
      {/* Toggle de idioma flotante: visible en toda la app, incluida la sala */}
      <LanguageToggle />
      <Navbar />
      <main className="app__contenido">
        <AppRouter />
      </main>
      <Footer />
    </div>
  );
}
