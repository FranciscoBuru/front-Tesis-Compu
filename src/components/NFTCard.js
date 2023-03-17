import React from 'react';
import './NFTCard.css'
import {useNavigate} from 'react-router-dom';

function NFTCard(props) {
  
  const navigate = useNavigate();
  //Agrefa tipos para redirigir a la pantalla correcta, crear subasta o ver estado de subasta. 
  return (
    <div className="card" onClick={() => navigate("/createAuction/"+props.nft.contract.address+"/"+props.nft.tokenId, {replace: false})}>
        <img src={props.nft ? (props.nft.metadataError === undefined ? (props.nft.media[0] === undefined ? (""):(props.nft.media[0].gateway)):("")):("")} alt='avatar'/>
        <div className='container'>
            <h4><b>{props.nft ? (props.nft.title+ "/" + props.nft.tokenId):("")}</b></h4>
            <h4><b>{props.nft ? (props.nft.description):("")}</b></h4>
            <p>{props.state ? (props.state):("")}</p>
            <p>{props.unitl ? (props.until):("")}</p>
        </div>
        
    </div>
  );
}

export default NFTCard;