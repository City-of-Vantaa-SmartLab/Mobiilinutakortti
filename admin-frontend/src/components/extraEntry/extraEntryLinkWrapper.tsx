import React from 'react';
import { ExtraEntryLink } from './extraEntryStyledComponents';
import { hrefFragmentToExtraEntry } from '../../utils';

interface ExtraEntryLinkWrapperProps {
    juniorId: string;
}

const ExtraEntryLinkWrapper: React.FC<ExtraEntryLinkWrapperProps> = ({ juniorId }) => {
    return (
        <ExtraEntryLink href={hrefFragmentToExtraEntry(juniorId)}>
            Muokkaa nuoren lisämerkintöjä
        </ExtraEntryLink>
    );
};

export default ExtraEntryLinkWrapper;
