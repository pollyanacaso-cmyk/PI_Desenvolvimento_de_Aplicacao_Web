// Importa o StrictMode do React, que ajuda a encontrar erros e boas práticas durante o desenvolvimento
import { StrictMode } from 'react'

// Importa a função createRoot do React 18+, responsável por renderizar a aplicação no HTML
import { createRoot } from 'react-dom/client'

// Importa o arquivo global de estilos CSS (onde o Tailwind CSS está configurado)
import './index.css'

// Importa o componente principal da aplicação (App)
import App from './App.tsx'

// 1. Procura no arquivo index.html o elemento com id="root"
// 2. O ponto de exclamação (!) garante ao TypeScript que essa div realmente existe
// 3. Monta a árvore do React dentro dessa div e renderiza o componente <App />
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
