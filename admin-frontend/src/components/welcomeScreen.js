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

const blink = keyframes`
  50% {
    box-shadow: 0 0 0 99999px rgba(0, 0, 0, .8);
  }
`;

const WelcomeWrapper = styled.div`
  animation: ${createBox} 0.2s linear, ${blink} 1.2s linear infinite;
  width: 30em;
  height: 30em;
  display: flex;
  margin: 4em 0em 4em;
  border: 4px solid #6bc24a;
  border-radius: 4px;
  justify-content: center;
  flex-direction: column;
 h2 {
   font-size: 3em;
   text-align: center;
   display: inline-block;
 }
 span{
   font-size: 2em;
   text-align: center;
   display: inline-block;
 }
`;
const WelcomeScreen = (props) =>
    <WelcomeWrapper>
            <span>Kirjautuminen onnistui </span>
            <h2>Tervetuloa</h2>
    </WelcomeWrapper>;

export default WelcomeScreen;