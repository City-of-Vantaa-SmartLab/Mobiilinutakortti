import { Card, CardContent, CardHeader, TextField, DialogTitle } from '@material-ui/core';
import styled from 'styled-components';

export const Container = styled.div`
    height: 100%;
    width: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

export const VerticalCardPadding = styled.div`
    padding-top: 40px;
`;

export const StyledDialogTitle = styled(DialogTitle)`
    padding-left: 0px !important;
`;

export const LogBookTextFieldContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
`;

export const LogBookCard = styled(Card)`
    width: 800px;
`;

export const LogBookCardHeader = styled(CardHeader)`
    text-align: center;
`;

export const LogBookCardContent = styled(CardContent)`
    margin: 0px 30px;
`;

export const LogBookCardContentSelect = styled(LogBookCardContent)`
    display: flex;
    justify-content: center;
`;

export const LogBookTextField = styled(TextField)`
    width:100px;
`;