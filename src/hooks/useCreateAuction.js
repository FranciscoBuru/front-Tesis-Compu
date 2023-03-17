import { useEffect, useState } from "react"
import { useContractFunction } from "@usedapp/core"
import { utils } from "ethers"
import AuctionFactory from "../chain-info/contracts/AuctionFactory.json"
import SealedBidAuction from "../chain-info/contracts/SealedBidAuction.json"
import IERC721 from "../chain-info/contracts/IERC721.json"
import { Contract } from "@ethersproject/contracts"

const useCreateAuction = (tokenAddress, tokenID) => {
    // address
    // abi
    // chainId
    const [auctionAddress, setAuctionAddress] = useState("0xcaF59bb98010fdd1Bba1c479b5Cc6DACf377eF4E")
    const ABI = AuctionFactory.abi
    const factoryAddress = "0xcaF59bb98010fdd1Bba1c479b5Cc6DACf377eF4E"
    const factoryInterface = new utils.Interface(ABI)
    const factoryContract = new Contract(factoryAddress, factoryInterface)
    const nftABI = IERC721.abi
    const erc721Interface = new utils.Interface(nftABI)
    const erc721Contract = new Contract(tokenAddress, erc721Interface)

    const auctionAbi = SealedBidAuction.abi
    const auctionInterface = new utils.Interface(auctionAbi)
    const auctionContract = new Contract(auctionAddress, auctionInterface)
    
    // approve / Create auction
    const { send: createAuctionSend, state: createAuctionState } =
        useContractFunction(factoryContract, "createSealedBidAuctionContract", {
            transactionName: "Create Auction",
        })
    const createApproveAndSend = (minPriceHash, revealTime, winnerTime) => {
        return createAuctionSend(minPriceHash, tokenAddress, tokenID, revealTime, winnerTime)
    }
    
    // stake / approve
    const { send: approveAuctionSend, state: approveAuctionState } =
        useContractFunction(erc721Contract, "approve", {
            transactionName: "Approve Token",
        })

    // transfer asset
    const { send: transferAssetSend, state: transferAssetState } =
        useContractFunction(auctionContract, "transferAssetToContract", {
            transactionName: "Transfer Token",
        })

    //useEffect
    useEffect(() => {
        console.log(createAuctionState)
        if (createAuctionState.status === "Success") {
            console.log(createAuctionState)
            setAuctionAddress(createAuctionState.receipt.events[0].address)
            approveAuctionSend(createAuctionState.receipt.events[0].address, tokenID) //Change params auction address, tokenID
        }
    }, [createAuctionState, tokenAddress])


    const [state, setState] = useState(createAuctionState)


    useEffect(() => {
        if (approveAuctionState.status === "Success") {
            transferAssetSend()
        }
    }, [approveAuctionState])



    useEffect(() => {
        if (createAuctionState.status === "Success") {
            if (approveAuctionState.status === "Success") {
                setState(transferAssetState)
            }else{
                setState(approveAuctionState)
            }
        } else {
            setState(createAuctionState)
        }
    }, [createAuctionState, approveAuctionState, transferAssetState])

    return { createApproveAndSend, state }
}

export default useCreateAuction;