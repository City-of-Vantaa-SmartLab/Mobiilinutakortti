import React from 'react';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import LoginPage from './loginPage/loginPage';
import QRPage from './QRPage/QRPage';
import ProtectedRoute  from './ProtectedRoute';

const Wrapper = styled.section`
`;


const App: React.FC = () => {
  return (
    <Wrapper>
      <Switch>
        <Route path='/login' component={LoginPage}/>
        <ProtectedRoute exact path='/' component={QRPage}/>
      </Switch>
    </Wrapper>
  );
}

export default App;
