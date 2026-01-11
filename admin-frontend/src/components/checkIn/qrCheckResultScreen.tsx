import styled from 'styled-components';
import CheckMark from './checkMark';
import ErrorMark from './errorMark';

const Wrapper = styled.div`
  position: absolute;
  max-width: 40em;
  width: 100%;
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
    font-size: 50px;
    font-family: 'GT-Walsheim-Bold';
`

const StyledText = styled.span`
    color: black;
    margin: auto;
    text-align: center;
    font-size: 28px;
`

const QrCheckResultScreen = (props: { successful: boolean; errorReason?: string }) => (
    <Wrapper>
        {props.successful && (
          <div className={"mark-container"}>
              <Header>Tervetuloa!</Header>
              <CheckMark />
              <StyledText>Kirjautuminen onnistui.</StyledText>
          </div>
            )}
        {!props.successful && (
          <div className={"mark-container"}>
              <Header>Jokin meni pieleen!</Header>
              <ErrorMark />
              {props.errorReason === 'PERMIT' ? (
                <StyledText>Nuorella ei ole lupaa osallistua tapahtumaan.</StyledText>
              ) : (
                <StyledText>Yrititkö kirjautua kahdesti samalla tunnuksella?</StyledText>
              )}
          </div>
            )}
    </Wrapper>
);
export default QrCheckResultScreen;
