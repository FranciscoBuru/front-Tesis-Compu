import './App.css';
import React, { useState } from 'react';
import { Outlet, Link } from "react-router-dom";
import { useEthers } from '@usedapp/core'



const App = (props) => {

  const [msj, setMsj] = useState("");


  const ConnectButton = () => {
    const { chainId, account, deactivate, activateBrowserWallet } = useEthers()
    // 'account' being undefined means that we are not connected.
    if (chainId !== undefined) {
      if (chainId.toString() === process.env.REACT_APP_CHAINID) {
        setMsj("")
      }else{
        setMsj("Please use "+process.env.REACT_APP_CHAIN_NAME) 
      }
    }

    if (account) return <button onClick={() => deactivate()}>Disconnect</button>
    else return <button onClick={() => activateBrowserWallet()}>Connect Wallet</button>
  }

  //<li><Link to="/">Home</Link></li>
  return (
    <>
      <nav>
        <ul>
          <li style={{float: "left"}}><Link to="/">Auctionator</Link></li>
          <li>
            <div className='btn'>
              <ConnectButton />
              <h2>{msj}</h2>
            </div>
          </li>
          <li>
            <Link to="mint">Mint</Link>
          </li>
          <li>
            <Link to="auction">Auction</Link>
          </li>
        </ul>
      </nav>
      

      <Outlet />
    </>
  )
};

export default App;
