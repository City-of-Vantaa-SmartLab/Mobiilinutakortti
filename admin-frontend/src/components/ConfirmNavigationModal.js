import React from "react";
import styled from "styled-components";
import { Button } from '@material-ui/core';

const ModalContainer = styled.div`
  position: fixed; 
  padding-top: 50px;
  left: 0; 
  top: 0;
  width: 100%;
  height: 100%; 
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
  .modal-content {
    background-color: white;
    padding: 1.2em; 
    margin: auto; 
    min-width: 200px;  
    max-width: 600px;
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
    text-align: center;
    font-size: 24px;
    .modal-button {
      margin-top: 1em;
      margin-right: 1em;
    }
  }
`

const ConfirmNavigationModal = ({onConfirm, onCancel}) => (
  <ModalContainer>
    <div className={"modal-content"}>
      <span>Näytöstä poistuminen vaatii uuden sisäänkirjautumisen</span>
      <div className={"buttons-container"}>
        <Button onClick={onConfirm} variant="contained" className={"modal-button"}>Jatka</Button>
        <Button onClick={onCancel} variant="contained" className={"modal-button"}>Peruuta</Button>
      </div>
    </div>
  </ModalContainer>
)

export default ConfirmNavigationModal;

