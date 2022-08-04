import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import { Config, DAppProvider, Rinkeby } from '@usedapp/core'


const config: Config = {
  readOnlyChainId: Rinkeby.chainId
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </React.StrictMode>
)
