import React, { useState, useEffect } from 'react';
import { useNotifications, useContractFunction } from '@usedapp/core'
import './BidAuction.css';
import { Network, Alchemy } from "alchemy-sdk";
import { utils } from 'ethers'
import { Contract } from "@ethersproject/contracts"
import SealedBidAuction from "../chain-info/contracts/SealedBidAuction.json"
import { useEthers } from '@usedapp/core'


function ClosedAuction() {

  const settings = {
      apiKey: process.env.REACT_APP_ALCHEMY, // Replace with your Alchemy API Key.
      network: Network.ETH_GOERLI, // Replace with your network.
  };
  const alchemy = new Alchemy(settings);
  const {account} = useEthers()

  let auctionAddress = window.location.href.split('/')[4]
  let nftAddress = window.location.href.split('/')[5]
  let tokenId = window.location.href.split('/')[6]

  const ethers = require('ethers');
  const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_INFURIA);

  const auctionAbi = SealedBidAuction.abi
  const auctionInterface = new utils.Interface(auctionAbi)
  const auctionContract = new Contract(auctionAddress, auctionInterface, provider)

  const { state: stateOwnerGetsPayed, send: sendOwnerGetsPayed } = useContractFunction(auctionContract, 'ownerGetsPayed', { transactionName: 'OwnerPay' })
  const { state: stateWinnerClaim, send: sendWinnerClaim } = useContractFunction(auctionContract, 'winnerRetrivesToken', { transactionName: 'WinnerClaim' })
  const { state: stateReinburse, send: sendReinburse } = useContractFunction(auctionContract, 'reimburseParticipant', { transactionName: 'ReinburseClaim' })


  const [token, setToken] = useState("");

  const [bidsEnd, setBidsEnd] = useState("");
  const [revealsEnd, setRevealsEnd] = useState("");

  const [error, setError] = useState("")
  
  const { notifications } = useNotifications()

  const [winner, setWinner] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [winningPrice, setWinningPrice] = useState("")
  const [owner, setOwner] = useState("")

  const [owed, setOwed] = useState("")


  const isMiningOwner = stateOwnerGetsPayed.status === "Mining"
  const isMiningWinner = stateWinnerClaim.status === "Mining"
  const isMiningReimb = stateReinburse.status === "Mining"


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
        setWinner(await auctionContract.winner())
        setMinPrice(await auctionContract.minimumPrice())
        setWinningPrice(await auctionContract.amount())
        setOwner(await auctionContract.owner())
      }
        fetchData()

  }, [])

  useEffect(() => {

    const fetchData = async () => {
        if(account !== undefined){
          console.log(account)
          let am = await auctionContract.accountToAmount(account)
          setOwed(am)
        }
        

      }
        fetchData()

  }, [account])

  const ownerFunc = () => {
    void sendOwnerGetsPayed()
  }

  const winnerFunc = () => {
    void sendWinnerClaim()
  }

  const reinFunc = () => {
    void sendReinburse()
  }

  useEffect(() => {
    let x
    if(stateOwnerGetsPayed.status === "Exception"){
        setError(stateOwnerGetsPayed.errorMessage)
        x = document.getElementById("snackbar2");
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }
    if(stateWinnerClaim.status === "Exception"){
        setError(stateWinnerClaim.errorMessage)
        x = document.getElementById("snackbar2");
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }
    if(stateReinburse.status === "Exception"){
        setError(stateWinnerClaim.errorMessage)
        x = document.getElementById("snackbar2");
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }
    
}, [stateOwnerGetsPayed, stateWinnerClaim, stateReinburse])



  return (
    <div className='home'>
      <h1>NFT was auctioned Auctioning</h1>
      <div className='center'>
        <div className='nft'>
            <img src={token ? (token.metadataError === undefined ? (token.media[0].gateway):("")):("")} alt='avatar'/>
            <div className='container'>
                <h4><b>{token ? (token.title+ "/" + token.tokenId):("")}</b></h4>
                <h4><b>{token ? (token.description):("")}</b></h4>
                <h4>Offers ended: {new Date(bidsEnd*1000).toString()}</h4>
                <h4>Reveals ended: {new Date(revealsEnd*1000).toString()}</h4>
            </div>
        </div>
        <div className='fields'>
          <label>Winner: {winner.substring(0,12)+ "..."} </label>
          <label>Min price: {minPrice.toString()/1000000000000000000} eth</label>
          <label>Gone for: {winningPrice.toString()/1000000000000000000} eth</label>
          {isMiningOwner ? (
          <>
            <button className="buttonload">
              <i className="fa fa-spinner fa-spin"></i>
              Mining
            </button>
            <div className="mint-text">
              {true ? (<p>Transaction Mining, <a href={process.env.REACT_APP_ETHERSCAN+stateOwnerGetsPayed.transaction.hash} target="_blank" rel="noreferrer">view on etherscan</a></p>):("")}
            </div>
          </>
          ):( account === owner ? (
            <button onClick={() => ownerFunc()}>
                {winningPrice.toString() > 0 ? ("Claim sale"):("Claim Token")}
            </button>):(<></>)
          )}

          {isMiningWinner ? (
          <>
            <button className="buttonload">
              <i className="fa fa-spinner fa-spin"></i>
              Mining
            </button>
            <div className="mint-text">
              {true ? (<p>Transaction Mining, <a href={process.env.REACT_APP_ETHERSCAN+stateWinnerClaim.transaction.hash} target="_blank" rel="noreferrer">view on etherscan</a></p>):("")}
            </div>
          </>
          ):( account === winner ? (
            <button onClick={() => winnerFunc()}>
                Claim NFT
            </button>):(<></>)
          )}

          {isMiningReimb ? (
          <>
            <button className="buttonload">
              <i className="fa fa-spinner fa-spin"></i>
              Mining
            </button>
            <div className="mint-text">
              {true ? (<p>Transaction Mining, <a href={process.env.REACT_APP_ETHERSCAN+stateReinburse.transaction.hash} target="_blank" rel="noreferrer">view on etherscan</a></p>):("")}
            </div>
          </>
          ):( owed.toString() > 0 ? (
            <button onClick={() => reinFunc()}>
                Get reimbursment 
                <br/>
                ({owed.toString()/1000000000000000000} eth)
            </button>):(<></>)
          )}
        

        </div>
      </div>
      <div id="snackbar1">Token Claimed</div>
      <div id="snackbar2"><h2>{error}</h2></div>
    </div>
    
  );
}

export default ClosedAuction;