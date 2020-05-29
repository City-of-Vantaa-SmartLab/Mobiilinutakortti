import React from 'react';
import styled from 'styled-components';

const CheckMarkContainer = styled.div`
  #line-1 {
    stroke-linecap: round;
    stroke-dasharray: 380;
    stroke-dashoffset: 380;
    -webkit-transform: translateZ(0);
    -moz-transform: translateZ(0);
    -ms-transform: translateZ(0);
    -o-transform: translateZ(0);
    transform: translateZ(0);
    animation: draw 0.3s ease forwards;
    -webkit-animation: draw 1s ease forwards;
    animation-fill-mode: forwards;
    animation-delay: 0.1s;
    transform-box: fill-box
}
  #line-2 {
    stroke-linecap: round;
    stroke-dasharray: 380;
    stroke-dashoffset: 380;
    -webkit-transform: translateZ(0);
    -moz-transform: translateZ(0);
    -ms-transform: translateZ(0);
    -o-transform: translateZ(0);
    transform: translateZ(0);
    animation: draw 0.5s ease forwards;
    -webkit-animation: draw 1s ease forwards;
    animation-fill-mode: forwards;
    transform-box: fill-box
    animation-delay: 0.3s;
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

const ErrorMark = () =>  (
  <CheckMarkContainer>
    <svg width={550} height={550} viewBox="0 0 500 500" >
      <g transform="translate(250, 250)">
        <circle cx="0" cy="0"  r="230" fill="#f9e51e" />
        <circle id="circle" cx="0" cy="0" r="186" fill="#f7423a" />
        <g >
          <line x1="-100" y1="-100" x2="100" y2="100"  id="line-1"  strokeWidth="50" stroke="white"
                strokeLinecap="round" />
          <line x1="100" y1="-100" x2="-100" y2="100" id="line-2" strokeWidth="50" stroke="white"
                strokeLinecap="round" />
        </g>
      </g>
    </svg>
  </CheckMarkContainer>
);

export default ErrorMark;
