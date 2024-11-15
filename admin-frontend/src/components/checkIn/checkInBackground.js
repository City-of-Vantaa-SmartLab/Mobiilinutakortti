import React from 'react';
import styled from 'styled-components';

const BG = styled.div`
    position: relative;
    width: 100%;
    height: 26%;
`;

const Triangle = styled.div`
    position: absolute;
    top: -15em;
    background: #3c8fde;
    min-height: 40em;
    width: 100%;
    height: 100%;
    transform: skew(0, -15deg);
    z-index: -10;
`;

const CheckinBackground = () => {
    return (
        <BG>
            <Triangle />
        </BG>
    )
};

export default CheckinBackground;
