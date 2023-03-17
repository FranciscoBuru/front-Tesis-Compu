import React, { useState, useEffect } from 'react';
import { useNotifications, useContractFunction } from '@usedapp/core'
import './BidAuction.css';
import { Network, Alchemy } from "alchemy-sdk";
import { utils } from 'ethers'
import { Contract } from "@ethersproject/contracts"
import SealedBidAuction from "../chain-info/contracts/SealedBidAuction.json"


function BidAuction() {

  const settings = {
      apiKey: process.env.REACT_APP_ALCHEMY, // Replace with your Alchemy API Key.
      network: Network.ETH_GOERLI, // Replace with your network.
  };
  const alchemy = new Alchemy(settings);

  let auctionAddress = window.location.href.split('/')[4]
  let nftAddress = window.location.href.split('/')[5]
  let tokenId = window.location.href.split('/')[6]

  const ethers = require('ethers');
  console.log(process.env.INFURIA)
  const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_INFURIA);

  const auctionAbi = SealedBidAuction.abi
  const auctionInterface = new utils.Interface(auctionAbi)
  const auctionContract = new Contract(auctionAddress, auctionInterface, provider)

  const { state: stateOffer, send: sendOffer } = useContractFunction(auctionContract, 'makeOffer', { transactionName: 'OfferTx' })

  const [amountToSend, setAmountToSend] = useState("");
  const [bid, setBid] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");

  const [bidsEnd, setBidsEnd] = useState("");
  const [revealsEnd, setRevealsEnd] = useState("");

  const [error, setError] = useState("")
  
  const { notifications } = useNotifications()

  const isMining = stateOffer.status === "Mining"


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
      }
        fetchData()

  }, [])

  const bidFunc = () => {
    let ether = utils.parseEther(String(bid))
    let amount2 = utils.parseEther(String(amountToSend))
    let hash = utils.solidityKeccak256(['string','uint256'],[secret, ether.toString()])
    console.log(hash)
    void sendOffer(hash, { value: amount2.toString() })
  }

useEffect(() => {
    if(stateOffer.status === "Exception"){
        setError(stateOffer.errorMessage)
        console.log(stateOffer)
        var x = document.getElementById("snackbar2");
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }
    
}, [stateOffer])




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
          <label>Offer (eth): 
            <input type="text" value={bid} onChange={res => setBid(res.target.value)}></input>
          </label>
          <label>Secret word [a-zA-Z]: 
            <input type="text" value={secret} onChange={res => setSecret(res.target.value)}></input>
          </label>
          <label>Amount to send (eth) (If lower than offer, bid will be invalid to contract): 
            <input type="text" value={amountToSend} onChange={res => setAmountToSend(res.target.value)}></input>
          </label>
          {isMining ? (
            <>
            <button className="buttonload">
              <i className="fa fa-spinner fa-spin"></i>
              Mining
            </button>
            <div className="mint-text">
            {true ? (<p>Transaction Mining, <a href={process.env.REACT_APP_ETHERSCAN+stateOffer.transaction.hash} target="_blank" rel="noreferrer">view on etherscan</a></p>):("")}
          </div>
          </>
          ):(
            <button onClick={() => bidFunc()}>Make Bid</button>
          )}
        </div>
      </div>
      <div id="snackbar1">Bid Made</div>
      <div id="snackbar2"><h2>{error}</h2></div>
    </div>
    
  );
}

export default BidAuction;