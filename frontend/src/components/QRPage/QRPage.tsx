import React from 'react'
import styled, { useTheme } from 'styled-components'
import Title from '../Title/Title'
import QR from '../QR/QR'
import { useTranslations } from '../translations'
import LanguageSelect from '../LanguageSelect'
import { useAppSelector } from '../../store/getStore'

export const Container = styled.div`
    width: 100%;
    height: 100%;
    background: ${p => p.theme.pages.qr.stripe};
    overflow: scroll;
    box-shadow: 12px 24px 100px rgba(0, 0, 0, 0.5);
    @media (min-width: 600px) {
        max-height: 812px
        max-width: 480px;
        margin: auto;
    }
`

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: calc(100% - 3rem);
    padding: 3rem 2.5rem 0 2.5rem;
    text-align: center;
    background: linear-gradient(-15deg, ${p => p.theme.pages.qr.background}, ${p => p.theme.pages.qr.background} 55%, transparent 55%, transparent);
`

const Header = styled.section`
    text-align: center;
    width: 100%;
    color: ${p => p.theme.pages.qr.headingText};
    & > p {
        font-size: 7vw;
        margin: 0;
    }
`

const Footer = styled.section`
    color: ${p => p.theme.pages.qr.footerText};
`

const QRPage: React.FC = () => {
    const t = useTranslations()
    const theme = useTheme()
    const { id, status } = useAppSelector((state) => state.user)
    return (
        <Container>
            <LanguageSelect color={theme.pages.qr.languageSelectText} />
            <Wrapper>
                <Header>
                    { /* props.name as subtitle would show nick name or first name, but is hidden for security reasons */ }
                    <Title title={t.qrPage.login} subtitle={t.qrPage.loginSubtitle} />
                </Header>
                <QR id={id} status={status} />
                <Footer>{t.qrPage.instruction}</Footer>
            </Wrapper>
        </Container>
    )
}

export default QRPage
