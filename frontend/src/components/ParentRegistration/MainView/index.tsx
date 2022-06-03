import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, MainWrapper, MainContent, MainHeader, MainDescription, Logo } from '../StyledComponents';
import { useTranslations } from '../../translations'

const ParentRedirectView: React.FC<RouteComponentProps> = (props) => {
    const t = useTranslations()
    return (
    <MainWrapper>
        <Logo><h2>Vantaa</h2></Logo>
        <MainContent>
            <MainHeader>
                <h1>{t.parentRedirect.title}</h1>
                <p>{t.parentRedirect.ingress}</p>
            </MainHeader>
            <MainDescription>
                {t.parentRedirect.description}
                <Button onClick={() => props.history.push('/hakemus')}>{t.parentRedirect.submit}</Button>
                <a target='_blank' rel="noopener noreferrer" href={t.parentRedirect.privacyPolicy.href}>
                    {t.parentRedirect.privacyPolicy.title}
                </a>
            </MainDescription>
        </MainContent>
    </MainWrapper>
)}

export default ParentRedirectView;
