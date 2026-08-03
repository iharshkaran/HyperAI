import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ChatProvider } from './context/ChatContext.tsx'
import { AppContextProvider } from './context/AppContext.tsx'

createRoot(document.getElementById('root')!).render(

  <BrowserRouter>
    <AppContextProvider>
      <AuthProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </AuthProvider>
    </AppContextProvider>
  </BrowserRouter>
)