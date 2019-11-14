import React from 'react';
import styled from 'styled-components';
import icon from '../../assets/ios-icon.png';

interface A2hsProps {
   isVisible: boolean;
   close: () => void;
}

const Wrapper = styled.div<{visible: boolean}>`
    display: ${(props) => props.visible ? "flex" : "None"};
    position: absolute;
    bottom: 0.5rem;
    left: 0rem;
    right: 0rem;
    padding: 1rem;
`;

const Popup = styled.div`
    display: flex;
    flex-direction: row;
    position: relative;
    width: 100%;
    text-align: center;
    background: #d9d9d6;
    border-radius: 0.3rem;
    box-sizing: border-box;
    &:before {
        content: "";
        position: absolute;
        top: 100%;
        left: calc(50% - 1rem);
        width: 0;
        border-top: 1rem solid #d9d9d6;
        border-left: 1rem solid transparent;
        border-right: 1rem solid transparent;
        
    }
    & > p {
        padding: 0 0 0 1rem;
        display: block;
    }
    & > p > i {
        height: 1.7rem;
        width: 1.7rem;
        background-image: url(${icon});
        background-size: contain;
        display: inline-block;
        vertical-align: middle;
    }
`;

const Close = styled.div`
    font-size: 2rem;
    padding: 1rem;
    cursor: pointer;
`;


const A2hs: React.FC<A2hsProps> = (props) => {

    return (
        <Wrapper visible={props.isVisible}>
            <Popup>
            <p>Klikkaa <i></i>-kuvaketta ja valitse ”Lisää Koti-valikkoon” lisätäksesi sovelluksen</p>
            <Close onClick={props.close}>&times;</Close>
            </Popup>
        </Wrapper>
    );
}

export default A2hs;
