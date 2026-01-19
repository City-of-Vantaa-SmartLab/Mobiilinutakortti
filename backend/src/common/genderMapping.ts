export enum Gender {
    Male = 'm',
    Female = 'f',
    Other = 'o',
    Undisclosed = '-',
}

export const genderMapping = [
    { nutakortti: Gender.Female, kompassiGenderId: 1 },
    { nutakortti: Gender.Male, kompassiGenderId: 2 },
    { nutakortti: Gender.Other, kompassiGenderId: 3 },
    { nutakortti: Gender.Undisclosed, kompassiGenderId: 4 }
];

export default genderMapping;
