import React, { useState, useEffect } from 'react';
import RegistrationForm from './Form';
import { Wrapper, Header, Confirmation, SuccessIcon, Error, Button, LogoutButton, LogoutLink } from './StyledComponents';
import { get, post } from '../../apis';

const RegistrationView: React.FC = (props) => {
    const  [submitted, setSubmitted] = useState(false);
    const [clubs, setClubs] = useState([]);
    const [error, setError] = useState(false);
    const [auth, setAuth] = useState(false);

    useEffect(()=> {
        post('/auth/validate-signature', {}) // TODO pass the security context, not empty object
            .then(response => {
                if (response.valid) {
                    setAuth(true);
                } else {
                    get('/acs')
                    .then(response => window.location.replace(response.url))
                    .catch(e => console.log(e))
                }
            })
            .catch(e => console.log(e))
    }, [])


    const logout = () => {
        get('/logout')
            .then(
                // TODO: handle response for logout
            )
            .catch((e) => {
                setError(true);
            })
    }

    //fetch club list
    useEffect(() => {
        get('/club/list')
            .then(response => setClubs(response))
            .catch((e) => { console.log(e);
                setError(true)})
    }, []);

    return (
        <Wrapper>
            <Header>Nutakortti-hakemus</Header>
            // TODO: needs && auth?
            {!submitted && !error &&
                <LogoutButton onClick={logout}>Logout</LogoutButton>
            }
            {!submitted && !error && auth &&
                <RegistrationForm onSubmit={()=>setSubmitted(true)} onError={()=>setError(true)} clubs={clubs}/>
            }
            {submitted && !error &&
            <Confirmation>
                <div>
                    <h2>Kiitos hakemuksestasi!</h2>
                    <p>Soitamme sinulle, kun olemme käsitelleet hakemuksen. Tämän jälkeen lähetämme nuorelle tekstiviestillä henkilökohtaisen kirjautumislinkin palveluun. You may now
                    <LogoutLink onClick={logout}> logout</LogoutLink>
                    </p>
                    <SuccessIcon/>
                </div>
            </Confirmation>
            }
             {error &&
             <Error>
                 <div>
                 <p>Something went wrong. Please, try again!</p>
                    <Button onClick={() => window.location.reload(false)}>Go back</Button>
                 </div>
            </Error>
            }
        </Wrapper>
    )
}

export default RegistrationView;
