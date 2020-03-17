import React from 'react';
import styled, { keyframes }  from 'styled-components';

const createBox = keyframes`
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
`;


const WelcomeWrapper = styled.div`
  animation: ${createBox} 0.15s linear;
  width: 30em;
  height: 30em;
  display: flex;
  margin: 4em 0em 4em;
  border: 4px solid #6bc24a;
  border-radius: 4px;
  align-items: center;
  justify-content: center;
 h2 {
   width: 100%;
   font-size: 3em;
   text-align: center;
 }
`;
const WelcomeScreen = (props) =>
    <WelcomeWrapper open={props.open}>
        {console.log(props.open)}
        <div className={"inner-container"}>
            <h2> Kirjautuminen onnistui </h2>
        </div>
    </WelcomeWrapper>;

export default WelcomeScreen;