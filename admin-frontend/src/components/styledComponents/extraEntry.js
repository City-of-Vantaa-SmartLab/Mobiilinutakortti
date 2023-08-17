import { Select } from '@material-ui/core';
import styled from 'styled-components';

export const ExtraEntryButton = styled.button`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    max-width: fit-content;
    margin: 5px;
    padding: 5px 10px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    svg {
        margin-left: 5px;
    }
`;

export const ExtraEntryTable = styled.table`
    margin-bottom: 40px;
    tr {
        line-height: 30px;
    }
    td, th {
        text-align: left;
    }
    a {
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }
`;