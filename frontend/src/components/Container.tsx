import styled from 'styled-components';

export const Container = styled.div<{width?:number, height?:number}>`
    width: 100%;
    height: 100%;
    background: #3c8fde;
    overflow: scroll;
    box-shadow: 12px 24px 100px rgba(0, 0, 0, 0.5);
    @media (min-width: 600px) {
        max-height: ${(props) => props.height ? props.height : 812}px
        max-width: ${(props) => props.width ? props.width : 480}px;
        margin: auto;
    }
`;