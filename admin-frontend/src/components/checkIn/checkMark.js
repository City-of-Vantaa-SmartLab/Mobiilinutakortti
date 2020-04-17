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
      <svg width={550} height={550} viewBox="0 0 500 500" >
        <g transform="translate(250, 250)">
            <circle cx="0" cy="0"  r="230" fill="#f9e51e" />
            <circle id="circle" cx="0" cy="0" r="186" fill="#6bc24a" />
          <g transform="translate(-120, -10) scale(0.9)">
                <path id="check" d="M0,0 l30,50 l80,-55" />
            </g>
        </g>
      </svg>
    </CheckMarkContainer>
);

export default CheckMark;