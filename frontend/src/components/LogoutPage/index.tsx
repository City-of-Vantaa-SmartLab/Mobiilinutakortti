import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    height: 100%;
    width: 100%;
    background: linear-gradient(-5deg, white, white 40%, #0042a5 calc(40% + 1px), #0042a5);
    padding: 0;
    display: flex;
    position: fixed;
    overflow: scroll;
    flex-direction: column;
    @media (max-width: 450px) {
        font-size: 14px;
    }
    @media (min-width: 1150px) {
        font-size: 18px;
    }
`;

const Logo = styled.div`
    color: white;
    height: calc(100px + 8vw);
    min-height: calc(100px + 8vw);
    width: 100%;
    background: linear-gradient(5deg, transparent, transparent 40%, #3c8fde calc(40% + 1px), #3c8fde);
    position: relative;
    box-sizing: border-box;
    @media (min-width: 2015px) {
        background: linear-gradient(3deg, transparent, transparent 40%, #3c8fde calc(40% + 1px), #3c8fde);
        height: calc(100px + 6vw);
    }
    & > h2 {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 2rem;
        font-size: 2em;
        padding-top: 0.5em;
        @media (max-width: 450px) {
            margin-bottom: 3em;
        }
        @media (min-width: 1050px) {
            font-size: 2.5em;
            padding-top: 1.5vw;
        }
    }
`;

const Header = styled.header`
    & > h1 {
        text-transform: uppercase;
        margin: 0;
        font-size: 3em;
        line-height: 50px;
        font-family: 'GT-Walsheim';
        color: white;
        padding-bottom: 20px;
    }
`;

const Description = styled.div`
    background: #fff;
    margin: auto;
    max-width: 800px;

    & > div {
        background: #fff;
        padding: 2em;
        & > h2 {
            margin-top: 0;
            color: #0042a5;
        }
    }
`;

const Content = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem 2rem;

`;

const LogoutView: React.FC = (props) => {
    return (
    <Wrapper>
        <Logo><h2>Vantaa</h2></Logo>
        <Content>
            <Header>
                <h1>Nutakortin hakeminen</h1>
            </Header>
            <Description>
              <div>
                <h2>Kiitos!</h2>
                <p>Olet nyt kirjautunut ulos. Kiitos palvelun käytöstä!</p>
              </div>
            </Description>
        </Content>
    </Wrapper>
)

}

export default LogoutView;
