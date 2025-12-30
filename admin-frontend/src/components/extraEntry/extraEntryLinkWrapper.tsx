import React from 'react';
import { ExtraEntryLink } from './extraEntryStyledComponents';
import { hrefFragmentToExtraEntry } from '../../utils';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';

interface ExtraEntryLinkWrapperProps {
    juniorId: string;
}

const ExtraEntryLinkWrapper: React.FC<ExtraEntryLinkWrapperProps> = ({ juniorId }) => {
    return (
        <ExtraEntryLink href={hrefFragmentToExtraEntry(juniorId)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <LibraryAddIcon /> Muokkaa nuoren lisämerkintöjä
        </ExtraEntryLink>
    );
};

export default ExtraEntryLinkWrapper;
