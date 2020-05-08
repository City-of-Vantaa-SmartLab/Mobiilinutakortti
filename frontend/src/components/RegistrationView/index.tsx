import React, { useState, useEffect } from 'react';
import RegistrationForm from './Form';
import { Wrapper, Header, Confirmation, SuccessIcon, Error, Button, LogoutButton, LogoutLink } from './StyledComponents';
import { get, post } from '../../apis';
import { RouteComponentProps } from 'react-router-dom';
import { isEmpty } from 'lodash';


const RegistrationView: React.FC<RouteComponentProps> = (props) => {
    const [submitted, setSubmitted] = useState(false);
    const [clubs, setClubs] = useState([]);
    const [error, setError] = useState(false);
    const [auth, setAuth] = useState(false);
    const [securityContext, setSecurityContext] = useState({})

    const getSecurityContext = () => {
        const query = new URLSearchParams(props.location.search);
        const sc_encoded = query.get('sc');
        if (sc_encoded) {
            const sc = atob(sc_encoded);
            sessionStorage.setItem('sc', sc);
            return JSON.parse(sc);   
        } else {
            return checkSessionStorage();
        }
    }

    const checkSessionStorage = () => {
        const sc = sessionStorage.getItem('sc');
        return sc ? JSON.parse(sc) : {};
    }

    useEffect(()=> {
        const sc = getSecurityContext();
        setSecurityContext(sc);
        post('/auth/validate-signature', sc )
            .then(response => {
                if (response.valid) {
                    setAuth(true);
                } else {
                    sessionStorage.removeItem('sc');
                    get('/acs')
                    .then(response => window.location.replace(response.url))
                    .catch(e => setError(true))
                }
            })
            .catch(e => setError(true))
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
            {!submitted && !error && auth &&
                <LogoutButton onClick={logout}>Logout</LogoutButton>
            }
            {!submitted && !error && auth &&
                <RegistrationForm securityContext={securityContext} onSubmit={()=>setSubmitted(true)} onError={()=>setError(true)} clubs={clubs}/>
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
