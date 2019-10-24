import React from 'react';
import styled from 'styled-components';

interface TitleProps {
    title: string,
    subtitle: string
}


const Main=styled.h1`
    font-weight: bold; 
    font-size: 9vw;  
    padding: 0;
    margin: 0;
    @media(min-width: 600px) {
        font-size: 3rem;
    }
`;

const Sub=styled.h3`
    font-size: 7vw;
    font-weight: 400;
    margin: 0;
    @media(min-width: 600px) {
        font-size: 2rem;
    }

`;


const Title: React.FC<TitleProps> = (props) => {

    return (
        <div>
            <Main>{props.title}</Main>
            <Sub>{props.subtitle}</Sub>
        </div>
    );
}

export default Title;        