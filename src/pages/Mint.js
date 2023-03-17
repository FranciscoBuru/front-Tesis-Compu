import React, { useEffect } from 'react';
import './Mint.css';
import { useEthers, useContractFunction, useNotifications } from '@usedapp/core'
import CollectibleCreator from "../chain-info/contracts/CollectibleCreator.json"
import { utils } from "ethers"
import { Contract } from "@ethersproject/contracts"

function Mint() {

  const { account, chainId } = useEthers();
  const nftABI = CollectibleCreator.abi
  const nftInterface = new utils.Interface(nftABI)
  const nftAddress = process.env.REACT_APP_NFT_ADDRESS
  const nftontract = new Contract(nftAddress, nftInterface)
  const { notifications } = useNotifications()


  const { state, send } = useContractFunction(nftontract, 'createCollectible', { transactionName: 'Create NFT' })
  const isMining = state.status === "Mining"

  const mintToken = () => {
    //var x = document.getElementById("snackbar");
    //x.className = "show";
    //setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    if(account){
      send()
    }
  }

  useEffect(() => {
    if (notifications.filter(
      (notification) =>
          notification.type === "transactionSucceed" &&
          notification.transactionName === "Create NFT").length > 0) {
            var x = document.getElementById("snackbar");
            x.className = "show";
            setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
          }
  },[notifications]);

  return (
    <div className="mint">
      <div className="mint-btn">
        {isMining ? (
        <button className="buttonload">
          <i className="fa fa-spinner fa-spin"></i>
          Mining
        </button> 
        ):(account ? (
          <button onClick={() => mintToken()}>
            Click to Mint
          </button>):("Please connect your wallet"))        
        }
      </div>
      <div className="mint-text">
        {isMining ? (<p>Transaction Mining, <a href={process.env.REACT_APP_ETHERSCAN+state.transaction.hash} target="_blank" rel="noreferrer">view on etherscan</a></p>):("")}
      </div>
      <div id="snackbar">NFT MINTED</div>
    </div>
  );
}

export default Mint;