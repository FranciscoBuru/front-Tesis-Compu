import React from 'react';
import './index.css';
import Home from './pages/Home';
import Mint from './pages/Mint';
import Auction from './pages/Auction';
import CreateAuction from './pages/CreateAuction';
import App from './App';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DAppProvider, Config } from '@usedapp/core'
import BidAuction from './pages/BidAuction';
import RevealBid from './pages/RevealBid';
import ClosedAuction from './pages/ClosedAuction';

const root = ReactDOM.createRoot(document.getElementById('root'));
const config: Config = {
  readOnlyChainId: process.env.REACT_APP_CHAINID,
  readOnlyUrls: {
    [process.env.REACT_APP_CHAINID]: process.env.REACT_APP_INFURIA,
  },
}


root.render(

  <DAppProvider config={config}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App config={config}/>}>
          <Route index element={<Home />} />
          <Route path="mint" element={<Mint />} />
          <Route path="auction" element={<Auction />} />
          <Route path="createAuction/:address/:id" element={<CreateAuction />} />
          {/* subasta/nft/token */}
          <Route path="bid/:address/:address/:id" element={<BidAuction />} />
          <Route path="reveal/:address/:address/:id" element={<RevealBid />} />
          <Route path="closed/:address/:address/:id" element={<ClosedAuction />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </DAppProvider>
);

