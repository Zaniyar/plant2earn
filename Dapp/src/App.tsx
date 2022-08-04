import React from 'react'
import {useEthers } from '@usedapp/core'

import './App.css'
import Container from './components/Container'

function App() {
  const { activateBrowserWallet, account } = useEthers()

  return (
    <div>
      <div>
        <button onClick={() => activateBrowserWallet()}>Connect</button>
      </div>
      {account &&
        <div> <p>Account: {account}</p>
          <Container />
        </div>
      }
    </div>
  )
}

export default App
