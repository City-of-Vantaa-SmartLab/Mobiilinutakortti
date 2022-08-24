import React from 'react';
import styled, { useTheme } from 'styled-components';
import { connect } from 'react-redux';
import { AppState } from '../../reducers';
import Title from '../Title/Title';
import QR from '../QR/QR';
import { useTranslations } from '../translations'
import LanguageSelect from '../LanguageSelect'

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
`;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: calc(100% - 3rem);
    padding: 3rem 2.5rem 0 2.5rem;
    text-align: center;
    background: linear-gradient(-15deg, ${p => p.theme.pages.qr.background}, ${p => p.theme.pages.qr.background} 55%, transparent 55%, transparent);
`;

const Header = styled.section`
    text-align: center;
    width: 100%;
    color: ${p => p.theme.pages.qr.headingText};
    & > p {
        font-size: 7vw;
        margin: 0;
    }
`;

const Footer = styled.section`
    color: ${p => p.theme.pages.qr.footerText};
`;

interface QRPageProps {
    id: string,
    name: string,
}

const QRPage: React.FC<QRPageProps> = (props) => {
    const t = useTranslations()
    const theme = useTheme()
    return (
        <Container>
            <LanguageSelect color={theme.pages.qr.languageSelectText} />
            <Wrapper>
                <Header>
                    <Title title={t.qrPage.login} subtitle={props.name} />
                </Header>
                <QR id={props.id}/>
                <Footer>{t.qrPage.instruction}</Footer>
            </Wrapper>
        </Container>
    );
}


const mapStateToProps = (state: AppState) => ({
    id: state.user.id,
    name: state.user.name
});


export default connect(mapStateToProps)(QRPage);
