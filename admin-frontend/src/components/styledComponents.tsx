import { Card, CardContent, CardHeader, TextField, DialogTitle, Button as MuiButton } from '@mui/material';
import styled from 'styled-components';
import { Field } from 'react-final-form';
import React, { useState } from 'react';
import { CalendarHelper } from './calendarHelper';
import { Button, Toolbar, SaveButton, DeleteButton, useRedirect } from 'react-admin';
import { useFormState } from 'react-hook-form';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import { Box, Paper } from '@mui/material';

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

export const QueryDatePickerField: React.FC = () => (
    <Field name="queryDate" defaultValue={new Date().toISOString().split('T')[0]}>
        {({ input }) => (
            <TextField
                {...input}
                label="Päivämäärä"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: 'fit-content' }}
                helperText={<CalendarHelper />}
            />
        )}
    </Field>
);

// Common button component for returning to list view
export const ReturnButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <Button label="Takaisin" onClick={onClick} alignIcon="left" sx={{ mr: 1 }}>
        <ArrowBackIcon />
    </Button>
);

// Modal backdrop component - reusable overlay for modals and dialogs
export const ModalBackdrop: React.FC<{ children: React.ReactNode; zIndex?: number; paddingTop?: string }> = ({
    children,
    zIndex = 1300,
    paddingTop = '80px'
}) => (
    <Box
        sx={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '1em',
            paddingTop,
        }}
    >
        {children}
    </Box>
);

// Modal content container - reusable Paper wrapper for modal content
export const ModalContent: React.FC<{ children: React.ReactNode; maxWidth?: string }> = ({
    children,
    maxWidth = '500px'
}) => (
    <Paper
        sx={{
            padding: { xs: '1em', sm: '1.5em' },
            maxWidth,
            width: '100%',
            maxHeight: 'calc(90vh - 80px)',
            overflow: 'auto',
        }}
    >
        {children}
    </Paper>
);

// Modal buttons container - reusable button layout
export const ModalButtonsContainer: React.FC<{ children: React.ReactNode; justifyContent?: string }> = ({
    children,
    justifyContent = 'flex-end'
}) => (
    <Box
        sx={{
            marginTop: '1.5em',
            display: 'flex',
            flexDirection: 'row',
            justifyContent,
            gap: '0.5em',
        }}
    >
        {children}
    </Box>
);

// Confirmation dialog component
const ConfirmationDialog: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => (
    <ModalBackdrop>
        <ModalContent>
            <h3 style={{ marginTop: 0 }}>Tallentamattomia muutoksia</h3>
            <p>Lomakkeella on tallentamattomia muutoksia. Haluatko <b>hylätä muutokset</b> ja palata listausnäkymään?</p>
            <ModalButtonsContainer>
                <MuiButton
                    onClick={onCancel}
                    variant="outlined"
                    color="primary"
                    size="large"
                    startIcon={<CancelIcon />}
                >
                    En
                </MuiButton>
                <MuiButton
                    onClick={onConfirm}
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<CheckIcon />}
                >
                    Kyllä
                </MuiButton>
            </ModalButtonsContainer>
        </ModalContent>
    </ModalBackdrop>
);

// Generic toolbar with return, save and optional delete buttons
export const CustomBasicToolbar: React.FC<{ listPath: string; showDelete?: boolean }> = (props) => {
    const { listPath, showDelete = false } = props as any;
    const redirect = useRedirect();
    const { isDirty } = useFormState();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleBack = () => {
        if (isDirty) {
            setShowConfirmDialog(true);
        } else {
            redirect(listPath);
        }
    };

    const handleConfirm = () => {
        setShowConfirmDialog(false);
        redirect(listPath);
    };

    const handleCancel = () => {
        setShowConfirmDialog(false);
    };

    return (
        <>
            {showConfirmDialog && <ConfirmationDialog onConfirm={handleConfirm} onCancel={handleCancel} />}
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <div>
                    <ReturnButton onClick={handleBack} />
                    <SaveButton />
                </div>
                {showDelete && <DeleteButton />}
            </Toolbar>
        </>
    );
};

const StyledLoadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    margin: 40px;
    font-size: 16px;
    color: #666;
`;

export const LoadingMessage: React.FC = () => (
    <StyledLoadingContainer>Ladataan...</StyledLoadingContainer>
);
