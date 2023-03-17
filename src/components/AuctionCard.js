import React,  { useState, useEffect }  from 'react';
import './NFTCard.css'
import {useNavigate} from 'react-router-dom';
import { Network, Alchemy } from "alchemy-sdk";
import { Contract } from "@ethersproject/contracts"
import SealedBidAuction from "../chain-info/contracts/SealedBidAuction.json"
import { utils} from "ethers"

function AuctionCard(props) {

    const Address = props.address
    const ABI = SealedBidAuction.abi
    const Interface = new utils.Interface(ABI)
    const ethers = require('ethers');
    const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_INFURIA);
    const contract = new Contract(Address, Interface, provider)
  
    const navigate = useNavigate();
    //Agrefa tipos para redirigir a la pantalla correcta, crear subasta o ver estado de subasta. 

    const settings = {
        apiKey: process.env.REACT_APP_ALCHEMY, // Replace with your Alchemy API Key.
        network: Network.ETH_GOERLI, // Replace with your network.
    };
    const alchemy = new Alchemy(settings);

    const [token, setToken] = useState(false);
    const [tokenAddress, setTokenAddress] = useState(false);
    const [tokenId, setTokenId] = useState(false);

    useEffect(() => {

        const fetchData = async () => {
            console.log(props.address)
            let tok
            const nftsForOwner = await alchemy.nft.getNftsForOwner(props.address);
            for (const nft of nftsForOwner.ownedNfts) {
            if(nft.tokenType === "ERC721"){
                tok = nft
            }
            }
            setToken(tok)
            if(props.state === "Closed"){
                let id = await contract.tokenId()
                let ad = await contract.parentNFT()
                id = id.toString()
                setTokenAddress(ad)
                setTokenId(id)
                tok = await alchemy.nft.getNftMetadata(ad, id)
                setToken(tok)
            }
        }
        if(props.address){
            fetchData()
        }
    }, [])


    if (props.state === "Bidding"){
        return (
        <div className="card" onClick={() => navigate("/bid/"+props.address+"/"+token.contract.address+"/"+token.tokenId, {replace: false})}>
            <img src={token ? (token.metadataError === undefined ? (token.media[0] === undefined ? (""):(token.media[0].gateway)):("")):("")} alt='avatar'/>
            <div className='container'>
                <h4><b>{token ? (token.title+ "/" + token.tokenId):("")}</b></h4>
                <h4><b>{token ? (token.description):("")}</b></h4>
                <h4><b>{token ? ("Auction State: " + props.state):("")}</b></h4>
            </div>
            
        </div>
        )


    }

    if (props.state === "Revealing"){
        return (
        <div className="card" onClick={() => navigate("/reveal/"+props.address+"/"+token.contract.address+"/"+token.tokenId, {replace: false})}>
            <img src={token ? (token.metadataError === undefined ? (token.media[0] === undefined ? (""):(token.media[0].gateway)):("")):("")} alt='avatar'/>
            <div className='container'>
                <h4><b>{token ? (token.title+ "/" + token.tokenId):("")}</b></h4>
                <h4><b>{token ? (token.description):("")}</b></h4>
                <h4><b>{token ? ("Auction State: " + props.state):("")}</b></h4>
            </div>
            
        </div>
        )


    }

    if (props.state === "Closed"){
        return (
        <div className="card" onClick={() => navigate("/closed/"+props.address+"/"+tokenAddress+"/"+tokenId, {replace: false})}>
            <img src={token ? (token.metadataError === undefined ? (token.media[0] === undefined ? (""):(token.media[0].gateway)):("")):("")} alt='avatar'/>
            <div className='container'>
                <h4><b>{token ? (token.title+ "/" + token.tokenId):("")}</b></h4>
                <h4><b>{token ? (token.description):("")}</b></h4>
                <h4><b>{token ? ("Auction State: " + props.state):("")}</b></h4>
            </div>
            
        </div>
        )


    }

    
        
}

export default AuctionCard;