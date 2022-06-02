import React from 'react';
import styled from 'styled-components';

const BG = styled.div`
position: relative;
width: 100%;
height: 26%;
top: 0;
left: 0;
border-radius: 2rem;
`;

const Triangle2 = styled.div`
 position: absolute;
 top: -6rem;
 background: ${p => p.theme.pages.login.stripe1};
 width: 100%;
 height: 100%;
 transform: skew(0, -15deg);
`;


const Triangle1 = styled.div`
 position: absolute;
 background: ${p => p.theme.pages.login.stripe2};
 top: -4.5rem;
 width: 100%;
 height: 100%;
 transform: skew(0, 15deg);
`
const LoginBackground: React.FC = () => {
    return (
        <BG>
            <Triangle1 />
            <Triangle2 />
        </BG>
    )
}


export default LoginBackground;
