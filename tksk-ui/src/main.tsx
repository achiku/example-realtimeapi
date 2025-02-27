import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DebtCollectionApp from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DebtCollectionApp />
  </StrictMode>,
)
