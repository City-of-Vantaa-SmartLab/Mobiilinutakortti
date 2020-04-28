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
    }
    & > p {
        color: white;
        margin: 0.5rem 0 1.5rem;
        font-weight: 600;
        font-size: 1.1em;
    }
`;

const Description = styled.div`
    background: rgb(249, 229, 30);
    padding: 1.5em;
    font-sise: 1em;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.25);
    & > p {
        margin: 0;
    }
`;

const Button = styled.button`
    font-family: 'GT-Walsheim';
    text-transform: uppercase;
    background: #3c8fde;
    border: none;
    color: #fff;
    padding: 1em 2em;
    margin: 1.5em 0;
    font-size: 1em;
    font-weight: 600;
    &:focus {
        outline: None;
    }
`;

const Content = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem 2rem;

`;

const ParentRedirectView: React.FC = (props) => {    
    return (
    <Wrapper>
        <Logo><h2>Vantaa</h2></Logo>
        <Content>
            <Header>
                <h1>Nutakortin hakeminen</h1>
                <p>Nutakortti on mobiililaitteella toimiva Vantaan nuorisotilojen jäsenkortti, jonka avulla nuori kirjautuu sisään nuorisotilaan.</p>
            </Header>
            <Description>
                <p>Tällä lomakkeella voit huoltajana hakea lapsellesi tai nuorellesi Vantaan kaupungin Nuorisopalveluiden jäsenkorttia. Kirjaudu sisään pankkitunnuksilla, mobiilivarmenteella tai sirullisella henkilökortilla ja täytä pyydetyt tiedot. <br/><br/> Kun hakemus on vastaanotettu, soitamme sinulle ja lähetämme nuorelle tekstiviestillä henkilökohtaisen kirjautumislinkin palveluun.</p>
                <Button>Täytä hakemus</Button>
                <a target='_blank' rel="noopener noreferrer" href="https://www.vantaa.fi/instancedata/prime_product_julkaisu/vantaa/embeds/vantaawwwstructure/148977_Henkilotietojen_kasittely_nuorisopalveluissa.pdf">Lue tarkemmin, kuinka käsittelemme tietojasi.</a>
            </Description>
        </Content>
    </Wrapper>
)

}

export default ParentRedirectView;