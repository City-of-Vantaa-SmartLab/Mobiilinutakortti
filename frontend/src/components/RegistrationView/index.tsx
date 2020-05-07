import React, { useState, useEffect } from 'react';
import RegistrationForm from './Form';
import { Wrapper, Header, Confirmation, SuccessIcon, Error, Button } from './StyledComponents';
import { get, post } from '../../apis';

const RegistrationView: React.FC = (props) => {  
    const  [submitted, setSubmitted] = useState(false);
    const [clubs, setClubs] = useState([]);
    const [error, setError] = useState(false);
    const [auth, setAuth] = useState(false);

    useEffect(()=> {
        post('/auth/validate-signature', {})
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
                <RegistrationForm onSubmit={()=>setSubmitted(true)} onError={()=>setError(true)} clubs={clubs}/>
            }
            {submitted && !error && 
            <Confirmation>
                <div>
                    <h2>Kiitos hakemuksestasi!</h2>
                    <p>Soitamme sinulle, kun olemme käsitelleet hakemuksen. Tämän jälkeen lähetämme nuorelle tekstiviestillä henkilökohtaisen kirjautumislinkin palveluun.</p>
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