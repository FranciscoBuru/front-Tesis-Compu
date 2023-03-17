import React, { useState, useEffect } from 'react';
import { useNotifications, useContractFunction } from '@usedapp/core'
import './BidAuction.css';
import { Network, Alchemy } from "alchemy-sdk";
import { utils } from 'ethers'
import { Contract } from "@ethersproject/contracts"
import SealedBidAuction from "../chain-info/contracts/SealedBidAuction.json"
import { useEthers } from '@usedapp/core'


function RevealBid() {

  const settings = {
      apiKey: process.env.REACT_APP_ALCHEMY, // Replace with your Alchemy API Key.
      network: process.env.REACT_APP_CHAINID, // Replace with your network.
  };

  const alchemy = new Alchemy(settings);

  let auctionAddress = window.location.href.split('/')[4]
  let nftAddress = window.location.href.split('/')[5]
  let tokenId = window.location.href.split('/')[6]

  const ethers = require('ethers');
  const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_INFURIA);
  const {account} = useEthers()

  const auctionAbi = SealedBidAuction.abi
  const auctionInterface = new utils.Interface(auctionAbi)
  const auctionContract = new Contract(auctionAddress, auctionInterface, provider)

  const { state: stateReveal, send: sendReveal } = useContractFunction(auctionContract, 'revealOffer', { transactionName: 'RevealTx' })
  const { state: stateRevealOwner, send: sendRevealOwner } = useContractFunction(auctionContract, 'winnerCalculation', { transactionName: 'RevealMinTx' })

  const [bid, setBid] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [owner, setOwner] = useState("")

  const [bidsEnd, setBidsEnd] = useState("");
  const [revealsEnd, setRevealsEnd] = useState("");

  const [error, setError] = useState("")
  
  const { notifications } = useNotifications()

  const isMining = stateReveal.status === "Mining"
  const isMiningOwner = stateRevealOwner.status === "Mining"


  useEffect(() => {

    const fetchData = async () => {
        const nft = await alchemy.nft.getNftMetadata(nftAddress, tokenId)
        console.log(nft)
        setToken(nft)
        let aux = await auctionContract.revealTime();
        console.log(aux)
        setBidsEnd(aux.toNumber())
        let aux2 = await auctionContract.winnerTime();
        console.log(aux2.toNumber())
        setRevealsEnd(aux2.toNumber())
        setOwner(await auctionContract.owner())
      }
        fetchData()

  }, [])

  const revealFunc = () => {
    let ether = utils.parseEther(String(bid))
    void sendReveal(secret, ether)
  }

  const revealOwnerFunc = () => {
    let ether = utils.parseEther(String(bid))
    void sendRevealOwner(secret, ether)
  }

useEffect(() => {
    if(stateReveal.status === "Exception"){
        setError(stateReveal.errorMessage)
        console.log(stateReveal)
        var x = document.getElementById("snackbar2");
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }
    if(stateRevealOwner.status === "Exception"){
      setError(stateRevealOwner.errorMessage)
      console.log(stateRevealOwner)
      var x = document.getElementById("snackbar2");
      x.className = "show";
      setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
  }
    
}, [stateReveal, stateRevealOwner])




  return (
    <div className='home'>
      <h1>NFT Auctioning</h1>
      <div className='center'>
        <div className='nft'>
            <img src={token ? (token.metadataError === undefined ? (token.media[0].gateway):("")):("")} alt='avatar'/>
            <div className='container'>
                <h4><b>{token ? (token.title+ "/" + token.tokenId):("")}</b></h4>
                <h4><b>{token ? (token.description):("")}</b></h4>
                <h4>Offers end: {new Date(bidsEnd*1000).toString()}</h4>
                <h4>Reveals end: {new Date(revealsEnd*1000).toString()}</h4>
            </div>
        </div>
        <div className='fields'>
          {owner === account ? (
            <>
              <h5>You have 5 minutes after {new Date(bidsEnd*1000).toString()} to revel the Min price.</h5>
              <label>Price (eth): 
                <input type="text" value={bid} onChange={res => setBid(res.target.value)}></input>
              </label>
              <label>Secret word: 
                <input type="text" value={secret} onChange={res => setSecret(res.target.value)}></input>
              </label>
              {isMiningOwner ? (
                <>
                <button className="buttonload">
                  <i className="fa fa-spinner fa-spin"></i>
                  Mining
                </button>
                <div className="mint-text">
                  {true ? (<p>Transaction Mining, <a href={process.env.REACT_APP_ETHERSCAN+stateRevealOwner.transaction.hash} target="_blank" rel="noreferrer">view on etherscan</a></p>):("")}
                </div>
                </>
              ):(
                <button onClick={() => revealOwnerFunc()}>Reveal Minimum Price</button>
              )}
            </>
          ):(
            <>
          <label>Offer (eth): 
            <input type="text" value={bid} onChange={res => setBid(res.target.value)}></input>
          </label>
          <label>Secret word: 
            <input type="text" value={secret} onChange={res => setSecret(res.target.value)}></input>
          </label>
          {isMining ? (
            <>
            <button className="buttonload">
              <i className="fa fa-spinner fa-spin"></i>
              Mining
            </button>
            <div className="mint-text">
            {true ? (<p>Transaction Mining, <a href={process.env.REACT_APP_ETHERSCAN+stateReveal.transaction.hash} target="_blank" rel="noreferrer">view on etherscan</a></p>):("")}
          </div>
          </>
          ):(
            <button onClick={() => revealFunc()}>Reveal Bid</button>
          )}
            </>
          )}
        </div>
      </div>
      <div id="snackbar1">Bid Revealed</div>
      <div id="snackbar2"><h2>{error}</h2></div>
    </div>
    
  );
}

export default RevealBid;