import React from 'react';
import { FunctionField } from 'react-admin';
import { Box } from '@material-ui/core';

export const PhoneNumberField = ({source}) => (
    <FunctionField
        render={(record) => {
            const val = (record && record[source]) ?? '';
            const m = val.match(/^(\+358)(.*)$/); // Only show Finnish numbers in easy for the eyes way.
            const prefix = m ? m[1] : '';
            const rest = (m ? m[2] : val);
            return (
                <span>
                    {prefix && <Box component="span" sx={{ mr: 0.5 }}>{prefix}</Box>}
                    <span>{rest}</span>
                </span>
            );
        }}
    />
);
