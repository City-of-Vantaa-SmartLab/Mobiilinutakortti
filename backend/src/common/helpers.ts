import { FilterDto, ListControlDto, SortDto } from './dto';
import { ValueTransformer } from 'typeorm';

export const obfuscate = (s: string): string => {
    return s.split(' ').map(item => {
        const first = item.slice(0, 1);
        const rest = item.slice(1).replace(/./g, '.');
        return first + rest;
    }).join(' ')
}

// Character varying-type saves values as strings, but they need to be fetched as numbers
export class NumberTransformer implements ValueTransformer {
    to(value: number): string {
        if (value) return value.toString();
    };

    from(value: string): number {
        if (value) return parseInt(value);
    };
};

// NB: will not return filters for extra entry types or entry permits, by design.
export const getFilters = (controls?: ListControlDto) => {
    let filterValues = {}, query = '';
    const filters: any = {filterValues, query};
    if (!controls) return filters;

    if (controls.sort) filters.order = applySort(controls.sort);
    if (controls.filters) ({ query, filterValues } = applyFilters(controls.filters));
    if (query) filters.query = query;
    if (filterValues) filters.filterValues = filterValues;
    if (controls.pagination) {
        filters.take = controls.pagination.perPage;
        filters.skip = controls.pagination.perPage * (controls.pagination.page - 1);
    }

    return filters;
}

export const applyFilters = (filterOptions: FilterDto) => {
    const filterValues = {}
    const queryParams = []

    Object.keys(filterOptions).forEach(property => {
        if (property === 'name') {
            queryParams.push("(CONCAT (junior.firstName, ' ', junior.lastName) ILIKE :name OR (junior.nickName) ILIKE :name)")
            filterValues['name'] = `%${filterOptions.name}%`
        } else if (property === 'phoneNumber') {
            queryParams.push('junior.phoneNumber ILIKE :phoneNumber')
            filterValues['phoneNumber'] = `%${filterOptions.phoneNumber}%`
        } else if (property === 'parentsPhoneNumber') {
            queryParams.push('junior.parentsPhoneNumber ILIKE :parentsPhoneNumber')
            filterValues['parentsPhoneNumber'] = `%${filterOptions.parentsPhoneNumber}%`
        } else if ((property === 'extraEntryType' || property === 'entryPermitType')) {
            // This filtering is done after database query.
        } else {
            queryParams.push(`junior.${property} = :${property}`)
            filterValues[property] = filterOptions[property]
        }
    })
    const query = queryParams.join(' AND ')
    return { query, filterValues }
}

export const applySort = (sortOptions: SortDto) => {
    const order = {};
    if (sortOptions.field.toLowerCase() === 'displayname') { sortOptions.field = 'firstName'; }
    if (sortOptions.field.toLowerCase() === 'extraentries' || sortOptions.field.toLowerCase() === 'entrypermits') { sortOptions.field = ''; }
    if (sortOptions.field) { order[`junior.${sortOptions.field}`] = sortOptions.order; }
    return order;
}

export const calculateAge = (birthday: string): number => {
    const birthDate = new Date(birthday);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

export const isBetween = (value: number, min: number, max: number): boolean => {
    return value <= max && value >= min;
}

export const formatName = (firstName: string, lastName: string, nickName: string): string => {
    let formattedName = `${firstName} `;
    if (nickName && nickName.trim() !== '') { formattedName += `'${nickName}' `; }
    return formattedName += lastName;
}

export const toBase64UrlString = (inputBuffer: Buffer): string => {
    return inputBuffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}
