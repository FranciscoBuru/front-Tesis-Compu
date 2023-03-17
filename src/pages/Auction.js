import React, { useState, useEffect } from 'react';
import './Auction.css';
import { useEthers } from '@usedapp/core'
import { Network, Alchemy } from "alchemy-sdk";
import NFTCard from '../components/NFTCard';


const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY, // Replace with your Alchemy API Key.
  network: process.env.REACT_APP_ALCHEMY_NETWORK, // Replace with your network.
};

function Auction() {

  const [msj, setMsj] = useState("");
  const [tokens, setTokens] = useState([]);

  const { account } = useEthers();
  const alchemy = new Alchemy(settings);


  useEffect(() => {
    if (account){
      setMsj("")
      let tok = []
      const fetchData = async () => {
        const nftsForOwner = await alchemy.nft.getNftsForOwner(account);
        for (const nft of nftsForOwner.ownedNfts) {
          if(nft.tokenType === "ERC721"){
            tok = [...tok, nft]
          }
        }
        setTokens(tok)
      }
      //setTokens(fetchData())
      fetchData()

    }else{
      setMsj(" ---Please connect your wallet---")
    }
  }, [account]);
  
  
  return (
    <>
    <div className="auc">
      <h1>Choose NFT to Auction {msj}</h1>
      <div className='cards'>
        { tokens.length > 0 && tokens.map((nft) => {
          return <NFTCard key ={nft.tokenId+nft.contract.address} nft={nft}/>
        })}
      </div>
    </div>

    </>
  );
}

export default Auction;