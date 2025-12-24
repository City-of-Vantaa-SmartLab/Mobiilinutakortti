import { Card, CardContent, CardHeader, TextField, DialogTitle } from '@mui/material';
import styled from 'styled-components';

export const Container = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    padding-top: 40px;
`;

export const VerticalCardPadding = styled.div`
    padding-top: 40px;
`;

export const StyledDialogTitle = styled(DialogTitle)`
    padding-left: 0px !important;
`;

export const CheckInLogTextFieldContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
`;

export const CheckInLogCard = styled(Card)`
    width: 100%;
    max-width: 800px;
`;

export const CheckInLogCardHeader = styled(CardHeader)`
    text-align: center;
`;

export const CheckInLogCardContent = styled(CardContent)`
    margin: 0px 30px;
`;

export const CheckInLogCardContentSelect = styled(CheckInLogCardContent)`
    display: flex;
    justify-content: center;
`;

export const CheckInLogTextField = styled(TextField)`
    width:100px;
`;
