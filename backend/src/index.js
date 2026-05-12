// Punto de entrada: levanta el servidor HTTP de la API
import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.PORT, () => {
  console.log(`Servidor escuchando en el puerto ${env.PORT}`);
});
