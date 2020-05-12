import React from 'react';
import styled from 'styled-components';
import CheckMark from './checkMark';
import ErrorMark from './errorMark';

const Wrapper = styled.div`
  width: 48em;
  height: 100%;
  display: flex;
  
  .mark-container{
    margin: auto;
    text-align: center;
  }
`;

const Header = styled.span`
    color: #f9e51e;
    display: inline-block;
    margin-top: 0.6em;
    margin-bot: 1.4em;
    font-size: 58px;
    font-family: 'GT-Walsheim-Bold';
    
`

const StyledText = styled.span`
    color: black;
    margin: auto;
    text-align: center;
    font-size: 32px;
`

const QrCheckResultScreen = (props) => (
    <Wrapper>
        {props.successful && (
          <div className={"mark-container"}>
              <Header>Tervetuloa!</Header>
              <CheckMark />
              <StyledText>{`Kirjautuminen nuorisotilaan onnistui!`}</StyledText>
          </div>
            )}
        {!props.successful && (
          <div className={"mark-container"}>
              <Header>Jokin meni pieleen!</Header>
              <ErrorMark />
              <StyledText>Yrititkö kirjautua samalla tunnuksella uudelleen sisään?</StyledText>
          </div>
            )}
    </Wrapper>
);
export default QrCheckResultScreen;