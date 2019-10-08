import React from 'react';
import styled from 'styled-components';

import LoginPage from './loginPage/loginPage';

const Wrapper = styled.section`
`;


const App: React.FC = () => {
  return (
    <Wrapper>
      <LoginPage/>
    </Wrapper>
  );
}

export default App;
