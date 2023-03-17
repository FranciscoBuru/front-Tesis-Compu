import React, { useState, useEffect } from 'react';
import './Home.css';
import AuctionCard from '../components/AuctionCard';
import AuctionFactory from "../chain-info/contracts/AuctionFactory.json"
import { utils} from "ethers"
import { Contract } from "@ethersproject/contracts"



function Home() {
  const [drop, setDrop] = useState("All");
  const factoryAddress = process.env.REACT_APP_FACTORY_ADDRESS
  const ABI = AuctionFactory.abi
  const Interface = new utils.Interface(ABI)
  const ethers = require('ethers');
  const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_INFURIA);
  const contract = new Contract(factoryAddress, Interface, provider)
  

  const [bidding, setBidding] = useState([])
  const [revealing, setRevealing] = useState([])
  const [closed, setClosed] = useState([])

  const [showBidding, setShowBidding] = useState(false)
  const [showRevealing, setShowRevealing] = useState(false)
  const [showClosed, setShowClosed] = useState(false)

  const [wait, setWait] = useState(true)

  useEffect(() => {
    if(drop === "All"){
      setShowBidding(true)
      setShowRevealing(true)
      setShowClosed(true)
    }
    if(drop === "Bidding"){
      setShowBidding(true)
      setShowRevealing(false)
      setShowClosed(false)
    }
    if(drop === "Revealing"){
      setShowBidding(false)
      setShowRevealing(true)
      setShowClosed(false)
    }
    if(drop === "Closed"){
      setShowBidding(false)
      setShowRevealing(false)
      setShowClosed(true)
    }
  }, [drop])


  useEffect(() => {
    if(bidding.length > 0 || revealing.length > 0 || closed.length > 0){
      setWait(false)
      setShowBidding(true)
      setShowRevealing(true)
      setShowClosed(true)
    }else{
      setWait(true)
      setShowBidding(false)
      setShowRevealing(false)
      setShowClosed(false)
    }
    
  }, [bidding, revealing, closed])

  useEffect(() => {
    getAuctions()
  }, [])

  const getAuctions = async() => {
      let i = 0
      let aux = true
      let res
      console.log("Clicked!")
      while (aux){
          console.log(i)
          res = await contract.sealedBidAuctionArrayContracts(i).catch(() => res = false)
          console.log(res)
          if (res){
              let state = await contract.getState(i)
              if(state !== 0){
                if(state === 1){
                  setBidding(bidding => [...bidding, res])
                }else if(state === 2){
                  setRevealing(revealing => [...revealing, res])
                }else {
                  setClosed(closed => [...closed, res])
                }
              }
              
          }else{
              aux = false
          }
          i = i+1
      }
  }

  return (
    <div className="home">
      <div className='main'>
        <h1>Auction state:</h1>
        <div className="dropdown">
            <button className="dropbtn">{drop}</button>
            <div className="dropdown-content">
                <a href='/#' onClick={() =>setDrop("All")}>All</a>
                <a href='/#' onClick={() =>setDrop("Bidding")}>Bidding</a>
                <a href='/#' onClick={() =>setDrop("Revealing")}>Revealing</a>
                <a href='/#' onClick={() =>setDrop("Closed")}>Closed</a>
            </div>
        </div>
      </div>
      <div className='cards'>
      { wait ? (<h2>Fetching data</h2>):(<></>)}
      {showBidding && bidding.length > 0 && bidding.map((add) => {
          return <AuctionCard key ={add} address={add} state="Bidding"/>
      })}
      {showRevealing && revealing.length > 0 && revealing.map((add) => {
          return <AuctionCard key ={add} address={add} state="Revealing"/>
      })}
      {showClosed && closed.length > 0 && closed.map((add) => {
          return <AuctionCard key ={add} address={add} state="Closed"/>
      })}
      </div>
    </div>
  );
}

export default Home;