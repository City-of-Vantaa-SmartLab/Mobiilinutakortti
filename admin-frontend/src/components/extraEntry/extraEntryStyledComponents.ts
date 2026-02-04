import styled from 'styled-components';

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

export const EmptyChoicesText = styled.p`
    font-style: italic;
    color: rgba(0, 0, 0, 0.54);
`;

export const ExtraEntryLink = styled.a`
    text-decoration: none;
    font-weight: bold;
    :hover {
        text-decoration: underline;
    }
`;
