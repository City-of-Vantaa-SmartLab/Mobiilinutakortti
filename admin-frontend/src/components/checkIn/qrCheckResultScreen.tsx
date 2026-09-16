import styled from 'styled-components'
import CheckMark from './checkMark'
import ErrorMark from './errorMark'

const Wrapper = styled.div`
  position: absolute;
  max-width: 40em;
  width: 100%;
  height: 100%;
  display: flex;

  .mark-container{
    margin: auto;
    text-align: center;
    max-width: 90vw;
  }
`

const Header = styled.span`
    color: #f9e51e;
    display: inline-block;
    margin-top: 0.3em;
    font-size: clamp(28px, 6vw, 50px);
    font-family: 'GT-Walsheim-Bold';
`

const StyledText = styled.span`
    margin: auto;
    text-align: center;
    font-size: clamp(18px, 4vw, 28px);
`

interface QrCheckResultScreenProps {
    checkInName?: string | null
    successful?: boolean | null
    errorReason?: string
}

const QrCheckResultScreen = (props: QrCheckResultScreenProps) => {
    const isSuccessful = props.successful ?? !!props.checkInName

    return (
    <Wrapper>
        {isSuccessful && (
          <div className={"mark-container"}>
              <Header>Tervetuloa!</Header>
              {/*
                For anonymity reasons, name is hidden even here.
                <Header>Tervetuloa {props.checkInName}!</Header>
              */}
              <CheckMark />
              <StyledText>Kirjautuminen onnistui.</StyledText>
          </div>
            )}
        {!isSuccessful && (
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
        )
      }

export default QrCheckResultScreen
