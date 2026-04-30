import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext.jsx'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: '#111', border: '1px solid #333', color: '#fff' } }} />
        <App />
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>,
)
