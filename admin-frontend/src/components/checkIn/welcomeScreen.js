import React from 'react';
import styled  from 'styled-components';
import CheckMark from './checkMark';

const WelcomeWrapper = styled.div`
  width: 48em;
  height: 100%;
  display: flex;
  margin: 0em 0em 4em;
`;

const WelcomeScreen = (props) => (
    <WelcomeWrapper>
        <CheckMark />
    </WelcomeWrapper>
);
export default WelcomeScreen;