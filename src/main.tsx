
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GlobalErrorBoundary } from './components/error-boundary/GlobalErrorBoundary'

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);
