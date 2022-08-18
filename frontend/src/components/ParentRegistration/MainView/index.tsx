import React from 'react';
import { Button, MainWrapper, MainContent, MainHeader, MainDescription, Logo } from '../StyledComponents';
import { useTranslations } from '../../translations'
import { useNavigate } from 'react-router-dom'
import LanguageSelect from '../../LanguageSelect'

const ParentRedirectView: React.FC = () => {
    const navigate = useNavigate()
    const t = useTranslations()
    return (
    <MainWrapper>
        <LanguageSelect />
        <Logo><h2>Vantaa</h2></Logo>
        <MainContent>
            <MainHeader>
                <h1>{t.parentRedirect.title}</h1>
                <p>{t.parentRedirect.ingress}</p>
            </MainHeader>
            <MainDescription>
                {t.parentRedirect.description}
                <Button onClick={() => navigate('/hakemus')}>{t.parentRedirect.submit}</Button>
                <a target='_blank' rel="noopener noreferrer" href={t.parentRedirect.privacyPolicy.href}>
                    {t.parentRedirect.privacyPolicy.title}
                </a>
            </MainDescription>
        </MainContent>
    </MainWrapper>
    )
}

export default ParentRedirectView;
