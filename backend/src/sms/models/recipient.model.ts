import { Language } from 'src/content';

export interface Recipient {
    lang: Language;
    name: string;
    phoneNumber: string;
    homeYouthClub?: number;
}
