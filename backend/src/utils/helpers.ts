import { FilterDto, SortDto } from "src/common/dto";
import { ValueTransformer } from "typeorm";

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
    return value.toString();
  };

  from(value: string): number {
    return parseInt(value);
  };
};

export const applyFilters = (filterOptions: FilterDto) => {
  const filterValues = {}
  const queryParams = []

  Object.keys(filterOptions).forEach(property => {
      if (property === 'name') {
          queryParams.push(`CONCAT (user.firstName, ' ', user.lastName) ILIKE :${property}`)
          filterValues[property] = `%${filterOptions[property]}%`
      } else if (property === 'phoneNumber') {
          queryParams.push(`user.phoneNumber ILIKE :${property}`)
          filterValues[property] = `%${filterOptions[property]}%`
      } else if (property === 'parentsPhoneNumber') {
          queryParams.push(`user.parentsPhoneNumber ILIKE :${property}`)
          filterValues[property] = `%${filterOptions[property]}%`
      } else {
          queryParams.push(`user.${property} = :${property}`)
          filterValues[property] = filterOptions[property]
      }
  })
  const query = queryParams.join(' AND ')
  return { query, filterValues }
}

export const applySort = (sortOptions: SortDto) => {
  const order = {};
  if (sortOptions.field.toLowerCase() === 'displayname') { sortOptions.field = 'firstName'; }
  if (sortOptions.field) { order[`user.${sortOptions.field}`] = sortOptions.order; }
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