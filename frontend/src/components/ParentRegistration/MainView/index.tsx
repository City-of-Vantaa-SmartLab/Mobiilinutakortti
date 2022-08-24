import React from 'react';
import { Button } from '../StyledComponents';
import { useTranslations } from '../../translations'
import { useNavigate } from 'react-router-dom'
import LanguageSelect from '../../LanguageSelect'
import styled, { useTheme } from 'styled-components'

const MainWrapper = styled.div`
    height: 100%;
    width: 100%;
    background: linear-gradient(-5deg, ${p => p.theme.pages.parentRedirect.background}, ${p => p.theme.pages.parentRedirect.background} 40%, ${p => p.theme.pages.parentRedirect.stripe2} calc(40% + 1px), ${p => p.theme.pages.parentRedirect.stripe2});
    padding: 0;
    display: flex;
    position: fixed;
    overflow: scroll;
    flex-direction: column;
    @media (max-width: 450px) {
        font-size: 14px;
    }
    @media (min-width: 1150px) {
        font-size: 18px;
    }
`;

const MainHeader = styled.header`
    & > h1 {
        text-transform: uppercase;
        margin: 0;
        font-size: 3em;
        line-height: 50px;
        font-family: ${p => p.theme.fonts.heading};
        color: ${p => p.theme.pages.parentRedirect.headingText};
    }
    & > p {
        color: ${p => p.theme.pages.parentRedirect.ingressText};
        margin: 0.5rem 0 1.5rem;
        font-weight: 600;
        font-size: 1.1em;
    }
`;

const MainContent = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem 2rem;
`;

export const MainDescription = styled.div`
    color: ${p => p.theme.pages.parentRedirect.description.text};
    background: ${p => p.theme.pages.parentRedirect.description.background};
    padding: 1.5em;
    font-size: 1em;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.25);
    & > p {
        margin: 0;
    }
`;

const LogoContainer = styled.div`
    color: white;
    height: calc(100px + 8vw);
    min-height: calc(100px + 8vw);
    width: 100%;
    background: linear-gradient(5deg, transparent, transparent 40%, ${p => p.theme.pages.parentRedirect.stripe1} calc(40% + 1px), ${p => p.theme.pages.parentRedirect.stripe1});
    position: relative;
    box-sizing: border-box;
    @media (min-width: 2015px) {
        background: linear-gradient(3deg, transparent, transparent 40%, ${p => p.theme.pages.parentRedirect.stripe1} calc(40% + 1px), ${p => p.theme.pages.parentRedirect.stripe1});
        height: calc(100px + 6vw);
    }
`;

const MainButton = styled(Button)`
    color: ${p => p.theme.pages.parentRedirect.description.buttonText};
    background: ${p => p.theme.pages.parentRedirect.description.buttonBackground};
`

const PrivacyPolicyLink = styled.a`
    color: ${p => p.theme.pages.parentRedirect.description.text};
`

const ParentRedirectView: React.FC = () => {
    const navigate = useNavigate()
    const t = useTranslations()
    const theme = useTheme()
    return (
    <MainWrapper>
        <LanguageSelect color={theme.pages.parentRedirect.languageSelectText} />
        <LogoContainer>{theme.pages.parentRedirect.logo}</LogoContainer>
        <MainContent>
            <MainHeader>
                <h1>{t.parentRedirect.title}</h1>
                <p>{t.parentRedirect.ingress}</p>
            </MainHeader>
            <MainDescription>
                {t.parentRedirect.description}
                <MainButton onClick={() => navigate('/hakemus')}>{t.parentRedirect.submit}</MainButton>
                <PrivacyPolicyLink target='_blank' rel="noopener noreferrer" href={t.parentRedirect.privacyPolicy.href}>
                    {t.parentRedirect.privacyPolicy.title}
                </PrivacyPolicyLink>
                {theme.pages.parentRedirect.description.bottomLogo}
            </MainDescription>
        </MainContent>
    </MainWrapper>
    )
}

export default ParentRedirectView;
