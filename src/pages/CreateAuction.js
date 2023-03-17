import React, { useState, useEffect } from 'react';
import { useNotifications } from '@usedapp/core'
import './CreateAuction.css';
import useCreateAuction from '../hooks/useCreateAuction'
import { Network, Alchemy } from "alchemy-sdk";
import { utils } from 'ethers'


function CreateAuction() {

  const settings = {
      apiKey: process.env.REACT_APP_ALCHEMY, // Replace with your Alchemy API Key.
      network: Network.ETH_GOERLI, // Replace with your network.
  };
  //console.log(Network.ETH_GOERLI)
  const alchemy = new Alchemy(settings);

  let address = window.location.href.split('/')[4]
  let tokenId = window.location.href.split('/')[5]

  const [minPrice, setMinPrice] = useState("");
  const [secret, setSecret] = useState("");

  const [token, setToken] = useState(false);

  const { createApproveAndSend, state } = useCreateAuction(address, tokenId)
  const isMining = state.status === "Mining"
  
  const { notifications } = useNotifications()

  const auctionCreation = () => {
    console.log(minPrice)
    let ether = utils.parseEther(String(minPrice))
    console.log(ether)
    let hash = utils.solidityKeccak256(['string','uint256'],[secret, ether.toString()])
    console.log(hash)
    createApproveAndSend(hash, (new Date(document.querySelector('input[class="reveal"]').value)).getTime()/1000, (new Date(document.querySelector('input[class="winner"]').value)).getTime()/1000)
  }

  useEffect(() => {

    const fetchData = async () => {
        const nft = await alchemy.nft.getNftMetadata(address, tokenId)
        console.log(nft)
        setToken(nft)
      }
        fetchData()
  }, [])

  useEffect(() => {
    var x
    if (notifications.filter(
      (notification) =>
        notification.type === "transactionSucceed" &&
        notification.transactionName === "Create Auction").length > 0) {
          x = document.getElementById("snackbar1");
          x.className = "show";
          setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
        }
    if (notifications.filter(
      (notification) =>
        notification.type === "transactionSucceed" &&
        notification.transactionName === "Approve Token").length > 0) {
          x = document.getElementById("snackbar2");
          x.className = "show";
          setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
      }
      if (notifications.filter(
        (notification) =>
          notification.type === "transactionSucceed" &&
          notification.transactionName === "Transfer Token").length > 0) {
            x = document.getElementById("snackbar3");
            x.className = "show";
            setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
        }
  },[notifications]);


  return (
    <div className='home'>
      <h1>Create NFT Auction</h1>
      <div className='center'>
        <div className='nft'>
            <img src={token ? (token.metadataError === undefined ? (token.media[0].gateway):("")):("")} alt='avatar'/>
            <div className='container'>
                <h4><b>{token ? (token.title+ "/" + token.tokenId):("")}</b></h4>
                <h4><b>{token ? (token.description):("")}</b></h4>
            </div>
        </div>
        <div className='fields'>
          <label>Min price (eth): 
            <input type="text" value={minPrice} onChange={res => setMinPrice(res.target.value)}></input>
          </label>
          <label>Secret word: 
            <input type="text" value={secret} onChange={res => setSecret(res.target.value)}></input>
          </label>
          <label>Offers end (UTC): 
            <input type="datetime-local" className='reveal'></input>
          </label>
          <label>Reveals end (UTC): 
            <input type="datetime-local" className='winner'></input>
          </label>
          {isMining ? (
            <button className="buttonload">
              <i className="fa fa-spinner fa-spin"></i>
              Mining
            </button> 
          ):(
            <button onClick={() => auctionCreation()}>Create Auction</button>
          )}
        </div>
      </div>
      <div id="snackbar1">Auction Created, Approve token transfer</div>
      <div id="snackbar2">Token approved, now transfer token</div>
      <div id="snackbar3">Auction is up and running!!</div>
    </div>
    
  );
}

export default CreateAuction;