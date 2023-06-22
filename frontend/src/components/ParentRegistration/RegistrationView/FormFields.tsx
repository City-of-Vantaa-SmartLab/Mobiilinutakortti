import React from 'react';
import { FieldProps, Field, FormikErrors } from 'formik';
import { get } from 'lodash';
import { Label, Description, ErrorMessage, Input, Select, SelectOption, SelectLabel, Radio, Dropdown } from '../StyledComponents'
import { useTranslations } from '../../translations'
import { Translations } from '../../../customizations/types'
import { ErrorKey, FormValues } from './Form'

const getFieldError = (t: Translations, errors: FormikErrors<FormValues>, fieldName: keyof FormValues): string | undefined => {
    const error = errors[fieldName] as ErrorKey
    if (error) {
        return t.parentRegistration.errors[error]
    } else {
        return undefined
    }
}


interface InputProps {
    title?: string,
    placeholder?: string,
    description?: string,
    type?: string
}

export const InputField: React.FC<FieldProps<string, FormValues> & InputProps> = ({
    field,
    title,
    placeholder,
    type,
    form: {touched, errors, handleBlur, setFieldValue},
    ...props
}) => {
    const t = useTranslations()
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === 'phone') {
            const val = e.target.value.replace(/[^\d+]/g, '');
            setFieldValue(field.name, val);
        }
        handleBlur(e)
    }
    const isTouched = get(touched, field.name);
    const error = getFieldError(t, errors, field.name as keyof FormValues);
    return (
        <div>
            <Label>{title}</Label>
            <Input placeholder={placeholder} {...field} {...props} onBlur={onBlur} />
            {isTouched && error && <ErrorMessage>{error}</ErrorMessage>}
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
    const t = useTranslations()
    const inputs = options.map(option => (
        <Field key={option.value} component={RadioField} name={name} data={option}/>
    ));
    return(
        <div>
            {title && <Label>{title}</Label>}
            <Description>{description && description.split('\\n').map((line, i) => <p key={i}>{line}</p>)}</Description>
            <Select>
                {inputs}
            </Select>
            {touched && error && <ErrorMessage>{t.parentRegistration.errors[error as ErrorKey]}</ErrorMessage>}
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
    const t = useTranslations()
    const isTouched = get(touched, field.name);
    const error = getFieldError(t, errors, field.name as keyof FormValues);
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




