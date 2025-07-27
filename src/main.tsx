
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppClerkProvider } from './integrations/clerk/client'

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AppClerkProvider>
      <App />
    </AppClerkProvider>
  </ErrorBoundary>
);
