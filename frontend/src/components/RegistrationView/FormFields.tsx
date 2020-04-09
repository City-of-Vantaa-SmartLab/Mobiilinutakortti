import React from 'react';
import styled from 'styled-components';
import { FieldProps, Field } from 'formik';
import { get } from 'lodash';


const Label = styled.label`
    color: #000;
    font-size: 1em;
    display: inline-block;
    padding: 1em 0 0.3em;
`;

const Input = styled.input`
    display: block;
    width: 100%;
    padding: 1em;
    border: 1px solid #000;
    box-sizing: border-box;
    box-shadow: 0;
    border-radius: 0;
    -webkit-appearance: none;
    -moz-appearance: non
    &:focus {
        outline: none;
    }  
`;

const ErrorMessage = styled.div`
    color: red;
    padding-top: 0.3em;
    font-size: 0.8em;
`;


interface InputProps {
    title: string;
    placeholder?: string;
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
            <Input placeholder={placeholder} {...field} {...props} onBlur={handleBlur}/>
            {isTouched &&
            error && <ErrorMessage>{error}</ErrorMessage>}
        </div>
    );
}


const Select = styled.div`
    width: 100%;
    display: flex;
    padding: 1em 0 0.5em;
`;

const Radio = styled.input.attrs({type: 'radio'})`
    &:checked, &:not(:checked) {
        position: absolute;
        visibility: hidden;
    }

    &:checked + label, &:not(:checked) + label {
        position: relative;
        padding-left: 26px;
        cursor: pointer;
        color: #000;
        line-height: 1.5em;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &:checked + label:before, &:not(:checked) + label:before {
        content: '';
        position: absolute;
        left: 0;
        width: 20px;
        height: 20px;
        border: 1px solid #000;
        border-radius: 100%;
        background: #fff;
    }
    &:checked + label:after, &:not(:checked) + label:after {
        content: '';
        width: 14px;
        height: 14px;
        background: #3c8fde;
        top: calc(50% - 7px);
        position: absolute;
        left: 4px;
        border-radius: 100%;
    }
    &:not(:checked) + label:after {
        opacity: 0;
    }
`;

const SelectOption = styled.div`
    display: inline-block;
    margin-right: 0.3em;
`;

const SelectLabel = styled.label`
    display: inline-block;
    font-size: 0.8em;
`;

const Description = styled.div`
    font-size: 0.8em;
    white-space: pre-wrap;
`


const RadioField: React.FC<InputProps & FieldProps> = ({
    field,
    title,
    form: {},
    ...props
  }) => {
    return (
        <SelectOption>
            <Radio type="radio" id={title} 
                name={field.name} 
                value={title} 
                checked={field.value === title} 
                onChange={field.onChange}
                {...props}
                onBlur={field.onBlur} 
                />
            <SelectLabel htmlFor={title}>{title}</SelectLabel>
        </SelectOption>
    )
}

interface GroupProps extends InputProps {
    options: string[],
    description?: string,
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
        <Field key={option} component={RadioField} name={name} title={option}/>
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


const Dropdown = styled.div`
    position: relative;
    display: flex;
    background: #fff;
    overflow: hidden;
    border: 1px solid #000;
    box-sizing: border-box;
    margin-top: 0.5em;
    align-items: center;
    & > select {
        -webkit-appearance: none;
        -moz-appearance: none;
        -ms-appearance: none;
        appearance: none;
        outline: 0;
        box-shadow: none;
        border: 0 !important;
        background: #fff;
        background-image: none;
        font-family: 'GT-Walsheim';

        flex: 1;
        padding: 1em;
        color: #000;
        cursor: pointer;
        & > option {
            color: #000;
        }
    }
    &::after {
        content: "\\2228";
        position: absolute;
        right: 0;
        padding: 0 1em;
        background: #fff;
        cursor: pointer;
        pointer-events: none;
        -webkit-transition: .25s all ease;
        -o-transition: .25s all ease;
        transition: .25s all ease;
    }
`;


interface DropdownProps extends InputProps {
    options: string[],
    description?: string,
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
            <option key={option} value={option}>{option}</option>
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



