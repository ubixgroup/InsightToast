import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from '@/components/ui/provider'
import { RootApp } from './RootApp'
import '@livekit/components-styles'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <RootApp />
    </Provider>
  </StrictMode>,
)
