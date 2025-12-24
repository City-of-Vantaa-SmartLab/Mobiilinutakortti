import React from 'react';
import { Wrapper, Header, Confirmation } from '../StyledComponents'
import { useTranslations } from '../../translations'

const LogoutView: React.FC = (_props: any) => {
    const t = useTranslations()
    return (
        <Wrapper>
            <Header>{t.logout.title}</Header>
            <Confirmation>
                <div>
                    <h2>{t.logout.heading}</h2>
                    <p>{t.logout.message}</p>
                </div>
            </Confirmation>
        </Wrapper>
    )
}

export default LogoutView;
