import React from 'react';
import styled from 'styled-components';

const CheckMarkContainer = styled.div`
  #check {
    fill: none;
    stroke: white;
    stroke-width: 20;
    stroke-linecap: round;
    stroke-dasharray: 180;
    stroke-dashoffset: 180;
    -webkit-transform: translateZ(0);
    -moz-transform: translateZ(0);
    -ms-transform: translateZ(0);
    -o-transform: translateZ(0);
    transform: translateZ(0);
    animation: draw 1.2s ease forwards;
    -webkit-animation: draw 1.2s ease forwards;
    transform-box: fill-box
    transform: scale(2.4) rotate(-13deg);
}
-webkit-@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
`

const CheckMark = () =>  (
    <CheckMarkContainer>
        <svg width={800} height={800} viewBox="0 0 800 800">
            <circle cx="400" cy="350" r="300" fill="#f9e51e" />
            <circle id="circle" cx="400" cy="350" r="245" fill="#6bc24a" />
            <g>
                <path id="check" d="M280,320 l30,50 l80,-55" />
            </g>
        </svg>
    </CheckMarkContainer>
);

export default CheckMark;