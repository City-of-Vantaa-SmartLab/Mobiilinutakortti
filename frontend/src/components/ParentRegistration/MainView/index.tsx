import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, MainWrapper, MainContent, MainHeader, MainDescription, Logo } from '../StyledComponents';

const ParentRedirectView: React.FC<RouteComponentProps> = (props) => {
    return (
    <MainWrapper>
        <Logo><h2>Vantaa</h2></Logo>
        <MainContent>
            <MainHeader>
                <h1>Nutakortin hakeminen</h1>
                <p>Nutakortti on maksuton mobiililaitteella toimiva Vantaan nuorisotilojen jäsenkortti, jonka avulla nuori kirjautuu sisään nuorisotilaan.</p>
            </MainHeader>
            <MainDescription>
                <p>
                    Tällä lomakkeella voit huoltajana hakea lapsellesi tai nuorellesi Vantaan
                    kaupungin Nuorisopalveluiden jäsenkorttia. Nutakortti uusitaan
                    toimintakausittain saman lomakkeen kautta. Kirjaudu sisään pankkitunnuksilla,
                    mobiilivarmenteella tai sirullisella henkilökortilla ja täytä pyydetyt tiedot.
                    <br /><br />
                    Kun hakemus on vastaanotettu, soitamme sinulle ja lähetämme nuorelle
                    tekstiviestillä henkilökohtaisen kirjautumislinkin palveluun.
                </p>
                <Button onClick={() => props.history.push('/hakemus')}>Täytä hakemus</Button>
                <a target='_blank' rel="noopener noreferrer" href="https://www.vantaa.fi/hallinto_ja_talous/hallinto/henkilotietojen_kasittely/informointiasiakirjat/nuorisopalveluiden_informointiasiakirja">Lue tarkemmin, kuinka käsittelemme tietojasi.</a>
            </MainDescription>
        </MainContent>
    </MainWrapper>
)}

export default ParentRedirectView;
