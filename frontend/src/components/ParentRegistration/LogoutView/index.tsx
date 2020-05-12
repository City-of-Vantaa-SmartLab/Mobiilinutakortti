import React from 'react';
import { Wrapper, Header, Confirmation } from '../StyledComponents'

const LogoutView: React.FC = (props) => {
    return (
        <Wrapper>
            <Header>Nutakortti-hakemus</Header>
            <Confirmation>
                <div>
                    <h2>Kiitos!</h2>
                    <p>Olet nyt kirjautunut ulos. Kiitos palvelun käytöstä!</p>
                </div>
            </Confirmation>
        </Wrapper>
    )
}

export default LogoutView;
