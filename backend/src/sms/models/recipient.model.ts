import { Language } from '../../content';

export interface Recipient {
    lang: Language;
    name: string;
    phoneNumber: string;
    homeYouthClub?: number;
}
