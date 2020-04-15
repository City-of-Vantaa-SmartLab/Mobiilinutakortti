import React, { useState } from 'react';
import styled from 'styled-components';
import RegistrationForm from './Form';

const Wrapper = styled.div`
    background: linear-gradient(-10deg, transparent, transparent 55%, #0042a5 calc(55% + 1px), #0042a5); 
    width: 100%;
    height: 100%;
    position: fixed;
    overflow: scroll;
    @media (max-width: 450px) {
        font-size: 14px;
    }
    @media (min-height: 1150px) {
        font-size: 19px;
    }
`;

const Header = styled.h1`
    text-align: center;
    color: rgb(249, 229, 30);
    font-size: 3em;
    margin: 0.5em 0.5em 0;
`;


const Confirmation = styled.div`
    margin: auto;
    max-width: 800px;
    
    padding: 2em;
    & > div {
        background: #fff;
        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.25);
        padding: 2em;
        & > h2 {
            margin-top: 0;
            color: #0042a5;
        }
    }
`;


const SuccessIcon = styled.div`
    margin: 2em 0;
    &:before {
        content: '\f06d';
        font-family: 'fontello';
        display: block;
        color: #4a7829;
        font-size: 10em;
        text-align: center;
    }
`;

const RegistrationView: React.FC = (props) => {  
    const  [submitted, setSubmitted] = useState(false);

    return (
        <Wrapper>
            <Header>Nutakortti-hakemus</Header>
            {!submitted &&
                <RegistrationForm onSubmit={()=>setSubmitted(true)}/>
            }
            {submitted &&
            <Confirmation>
                <div>
                <h2>Kiitos hakemuksestasi!</h2>
                <p>Soitamme sinulle, kun olemme käsittelleet hakemuksen. Tämän jälkeen lähetämme nuorelle tekstiviestillä henkilökohtaisen kirjautumislinkin palveluun.</p>
                <SuccessIcon/>
                </div>
            </Confirmation>
            }
        </Wrapper>
    )
}

export default RegistrationView;