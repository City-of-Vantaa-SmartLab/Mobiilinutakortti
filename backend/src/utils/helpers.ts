import { FilterDto, ListControlDto, SortDto } from "src/common/dto";
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

export const getFilters = (controls?: ListControlDto) => {
  let order = {}, filterValues = {}, query = '', take = 0, skip = 0;
  if (controls) {
      order = controls.sort ? applySort(controls.sort) : {};
      ({ query, filterValues } = controls.filters ? applyFilters(controls.filters) : { query: '', filterValues: [] });
      take = controls.pagination ? controls.pagination.perPage : 0;
      skip = controls.pagination ? controls.pagination.perPage * (controls.pagination.page - 1) : 0;
  }
  return {order, filterValues, query, take, skip}
}

export const applyFilters = (filterOptions: FilterDto) => {
  const filterValues = {}
  const queryParams = []

  Object.keys(filterOptions).forEach(property => {
      if (property === 'name') {
          queryParams.push("CONCAT (junior.firstName, ' ', junior.lastName) ILIKE :name")
          filterValues['name'] = `%${filterOptions.name}%`
      } else if (property === 'phoneNumber') {
          queryParams.push('junior.phoneNumber ILIKE :phoneNumber')
          filterValues['phoneNumber'] = `%${filterOptions.phoneNumber}%`
      } else if (property === 'parentsPhoneNumber') {
          queryParams.push('junior.parentsPhoneNumber ILIKE :parentsPhoneNumber')
          filterValues['parentsPhoneNumber'] = `%${filterOptions.parentsPhoneNumber}%`
      } else if (property === 'extraEntryType') {
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
  if (sortOptions.field.toLowerCase() === 'extraentries') { sortOptions.field = 'extraEntries.extraEntryType.name'; }
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
