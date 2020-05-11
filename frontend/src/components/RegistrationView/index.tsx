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

    const queryToSecurityContext = () => {
        const query = new URLSearchParams(props.location.search);
        const sc_encoded = query.get('sc');
        if (sc_encoded) {
            let b64str = sc_encoded.replace(/-/g, '+').replace(/_/g, '/');
            const pad = sc_encoded.length % 4;
            if (pad) {
                if (pad === 1) {
                    // TODO: this is an error, throw exception or something?
                    console.log('base64url string is the wrong length');
                }
                b64str += new Array(5-pad).join('=');
            }
            const sc = atob(b64str);
            sessionStorage.setItem('sc', sc);
        }
    }

    const getSecurityContext = () => {
        const sc = sessionStorage.getItem('sc');
        return sc ? JSON.parse(sc) : {};
    }

    useEffect(()=> {
        queryToSecurityContext();
        const sc = getSecurityContext();
        setSecurityContext(sc); // <- TODO what does this do?
        post('/auth/validate-signature', sc)
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
        const sc = getSecurityContext();
        // Suomi.fi documentation says the local session should be ended before SSO logout.
        sessionStorage.removeItem('sc');
        get('/logout', JSON.stringify(sc))
            .then(response => {
                if (response.url) {
                    window.location.replace(response.url);
                } else {
                    setError(true);
                    // TODO: remove query string from url (by going to some generic error page?)
                }
            })
            .catch((e) => {
                setError(true);
            })
    }

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
                <LogoutButton onClick={logout}>Kirjaudu ulos</LogoutButton>
            }
            {!submitted && !error && auth &&
                <RegistrationForm securityContext={securityContext} onSubmit={()=>setSubmitted(true)} onError={()=>setError(true)} clubs={clubs}/>
            }
            {submitted && !error &&
            <Confirmation>
                <div>
                    <h2>Kiitos hakemuksestasi!</h2>
                    <p>Soitamme sinulle, kun olemme käsitelleet hakemuksen. Tämän jälkeen lähetämme nuorelle tekstiviestillä henkilökohtaisen kirjautumislinkin palveluun. Voit nyt
                    <LogoutLink onClick={logout}> kirjautua ulos</LogoutLink>.
                    </p>
                    <SuccessIcon/>
                </div>
            </Confirmation>
            }
             {error &&
             <Error>
                 <div>
                 <p>Hups, jokin meni pieleen! Ole hyvä ja yritä uudelleen.</p>
                    <Button onClick={() => window.location.reload(false)}>Takaisin</Button>
                 </div>
            </Error>
            }
        </Wrapper>
    )
}

export default RegistrationView;
