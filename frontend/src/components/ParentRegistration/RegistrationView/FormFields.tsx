import React from 'react';
import { FieldProps, Field } from 'formik';
import { get } from 'lodash';
import { Label, Description, ErrorMessage, Input, Select, SelectOption, SelectLabel, Radio, Dropdown } from '../StyledComponents'


interface InputProps {
    title: string,
    placeholder?: string,
    description?: string
}

export const InputField: React.FC<FieldProps & InputProps> = ({
    field,
    title,
    placeholder,
    form: {touched, errors, handleBlur},
    ...props
}) => {
    const isTouched = get(touched, field.name);
    const error = get(errors, field.name);
    return (
        <div>
            <Label>{title}</Label>
            <Input placeholder={placeholder} {...field} {...props} onBlur={handleBlur} />
            {isTouched &&
            error && <ErrorMessage>{error}</ErrorMessage>}
        </div>
    );
}

interface SelectItem {
    value: string,
    label: string
}

interface RadioProps {
    data: SelectItem,
}

const RadioField: React.FC<RadioProps & FieldProps> = ({
    field,
    data,
    form,
    ...props
  }) => {
    return (
        <SelectOption>
            <Radio type="radio" id={data.value} 
                name={field.name} 
                value={data.value} 
                checked={field.value === data.value} 
                onChange={field.onChange}
                {...props}
                onBlur={field.onBlur} 
                />
            <SelectLabel htmlFor={data.value}>{data.label}</SelectLabel>
        </SelectOption>
    )
}


interface GroupProps extends InputProps {
    options: SelectItem[],
    name: string,
    error?: string,
    touched?: boolean
}

export const SelectGroup: React.FC<GroupProps> = ({
    name,
    title,
    error,
    touched,
    options, 
    description
}) => {
    const inputs = options.map(option => (
        <Field key={option.value} component={RadioField} name={name} data={option}/>
    ));
    return(
        <div>
            <Label>{title}</Label>
            <Description>{description && description.split('\\n').map((line, i) => <p key={i}>{line}</p>)}</Description>
            <Select>
                {inputs}
            </Select>
            {touched &&
            error && <ErrorMessage>{error}</ErrorMessage>}
        </div>
    )
}

interface DropdownProps extends InputProps {
    options: SelectItem[],
    defaultChoice: string
}

export const DropdownField: React.FC<DropdownProps & FieldProps> = ({
    field,
    title,
    defaultChoice,
    options,
    form: {touched, errors, handleBlur},
    ...props
}) => {
    const isTouched = get(touched, field.name);
    const error = get(errors, field.name);
    const inputs = options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
    ));
    return(
        <div>
            <Description>{props.description}</Description>
            <Dropdown>
                <select {...field} {...props} onBlur={handleBlur}>
                    <option disabled value="">{defaultChoice}</option>
                    {inputs}
                </select>
            </Dropdown>
            {isTouched &&
            error && <ErrorMessage>{error}</ErrorMessage>}
        </div>
    )
}




