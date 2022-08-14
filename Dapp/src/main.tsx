import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import { Config, DAppProvider, Mumbai, Rinkeby } from '@usedapp/core'

export const CONTRACT_ADDRESS: string = "0x5452114f67d72221b0edf57edd2e641c55329eb9";

export const SELL_PRICE = 20000000000000000;
export const SEEDING_PRICE = SELL_PRICE / 20;
export const WATERING_PRICE = SELL_PRICE / 100;
export const MAX_WATERING_COUNTER = 10;
export const MAX_HARVEST_LEVEL_COUNTER = 5;

const config: Config = {
  readOnlyChainId: Mumbai.chainId
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </React.StrictMode>
)
