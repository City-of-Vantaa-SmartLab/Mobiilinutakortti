import React from 'react';
import { Field, FormikProps, withFormik, FieldProps } from 'formik';
import { string, object, boolean, Schema } from 'yup';
import { post } from '../../../apis';

import { InputField, DropdownField, SelectGroup } from './FormFields';
import { Form, Column, Fieldset, FieldTitle, Checkbox, FormFooter, Button, ErrorMessage } from '../StyledComponents';
import { useTranslations } from '../../translations'
import { Translations } from "../../../customizations/types";
import { languages } from '../../../customizations'
import styled, { useTheme } from 'styled-components'

export interface Club {
    id: number
    name: string
}

export interface FormValues {
    juniorFirstName: string,
    juniorLastName: string,
    juniorNickName: string,
    juniorBirthday: string,
    juniorPhoneNumber: string,
    juniorGender: string,
    postCode: string,
    photoPermission: string,
    school: string,
    class: string,
    communicationsLanguage: string
    parentFirstName: string,
    parentLastName: string,
    parentPhoneNumber: string,
    youthClub: string,
    termsOfUse: boolean
}

export type ErrorKey = keyof Translations['parentRegistration']['errors']

const SubmitButton = styled(Button)`
    color: ${p => p.theme.pages.registration.submitButtonText};
    background: ${p => p.theme.pages.registration.submitButtonBackground};
`


const InnerForm = (props: FormikProps<FormValues>) => {
    const t = useTranslations()
    const theme = useTheme()
    const { handleSubmit, handleReset, touched, errors, status } = props;
    return (
            <Form onReset={handleReset} onSubmit={handleSubmit} autoComplete={`off-random-${Math.random()}`}>
                <Column>
                    <Fieldset>
                        <FieldTitle>{t.parentRegistration.form.juniorHeading}</FieldTitle>
                        <Field name='juniorFirstName' component={InputField} title={t.parentRegistration.form.juniorFirstName} />
                        <Field name='juniorLastName' component={InputField} title={t.parentRegistration.form.juniorLastName} />
                        <Field name='juniorNickName' component={InputField} title={t.parentRegistration.form.juniorNickName} />
                        <Field name='juniorBirthday' component={InputField} title={t.parentRegistration.form.juniorBirthday} placeholder={t.parentRegistration.form.juniorBirthdayPlaceholder} />
                        <Field name='juniorPhoneNumber' component={InputField} type='phone' title={t.parentRegistration.form.juniorPhoneNumber} />
                        <Field name='postCode' component={InputField} title={t.parentRegistration.form.postCode} />
                        <Field name='school' component={InputField} title={t.parentRegistration.form.school} />
                        <Field name='class' component={InputField} title={t.parentRegistration.form.class} />

                        <SelectGroup
                            error={errors.juniorGender}
                            touched={touched.juniorGender}
                            title={t.parentRegistration.form.juniorGender}
                            name="juniorGender"
                            options={[
                              { value: 'f', label: t.parentRegistration.form.juniorGenderOptions.f },
                              { value: 'm', label: t.parentRegistration.form.juniorGenderOptions.m },
                              { value: 'o', label: t.parentRegistration.form.juniorGenderOptions.o },
                              { value: '-', label: t.parentRegistration.form.juniorGenderOptions['-'] }
                            ]}
                        />

                        <SelectGroup
                            error={errors.photoPermission}
                            touched={touched.photoPermission}
                            title={t.parentRegistration.form.photoPermission}
                            name="photoPermission"
                            description={t.parentRegistration.form.photoPermissionDescription}
                            options={[
                              { value: 'y', label: t.parentRegistration.form.photoPermissionOptions.y },
                              { value: 'n', label: t.parentRegistration.form.photoPermissionOptions.n }
                            ]}
                        />

                    </Fieldset>
                </Column>
                <Column>
                    <Fieldset>
                        <FieldTitle>{t.parentRegistration.form.parentHeading}</FieldTitle>
                        <Field disabled name='parentFirstName' component={InputField} title={t.parentRegistration.form.parentFirstName} />
                        <Field disabled name='parentLastName' component={InputField} title={t.parentRegistration.form.parentLastName} />
                        <Field name='parentPhoneNumber' component={InputField} type='phone' title={t.parentRegistration.form.parentPhoneNumber} />
                    </Fieldset>

                    <Fieldset>
                        <FieldTitle>{t.parentRegistration.form.youthClubHeading}</FieldTitle>
                        <Field
                            name='youthClub'
                            component={DropdownField}
                            title={t.parentRegistration.form.youthClubHeading}
                            options={status.clubs}
                            defaultChoice={t.parentRegistration.form.youthClubDefault}
                            description={t.parentRegistration.form.youthClubDescription}
                        />
                    </Fieldset>

                    <Fieldset>
                        <FieldTitle>{t.parentRegistration.form.communicationsLanguage}</FieldTitle>
                        <Field
                            name='communicationsLanguage'
                            component={DropdownField}
                            title={t.parentRegistration.form.communicationsLanguage}
                            options={languages.map((lang) => ({ value: lang, label: t.languages[lang] }))}
                            defaultChoice={t.parentRegistration.form.communicationsLanguageDefault}
                            description={t.parentRegistration.form.communicationsLanguageDescription}
                        />
                    </Fieldset>
                </Column>
                <FormFooter>
                    <Field name='termsOfUse'>
                        {({ field }: FieldProps) => (
                          <div>
                            <Checkbox type='checkbox' checked={field.value} id={field.name} {...field} />
                            <label htmlFor={field.name}>{t.parentRegistration.form.termsOfUse}</label>
                          </div>
                        )}
                    </Field>
                    <ErrorMessage>{errors.termsOfUse && t.parentRegistration.errors[errors.termsOfUse as ErrorKey]}</ErrorMessage>
                    <SubmitButton type="submit">{t.parentRegistration.form.submit}</SubmitButton>
                    <a target='_blank' rel="noopener noreferrer" href={t.parentRegistration.form.privacyPolicy.href}>
                        {t.parentRegistration.form.privacyPolicy.title}
                    </a>
                    {theme.pages.registration.bottomLogo}
                </FormFooter>
            </Form>
    )
}

const getParsedBirthday = (value: any) => {
    const birthday = value.split('.');
    const parsedDate = new Date(parseInt(birthday[2]), parseInt(birthday[1])-1, parseInt(birthday[0]));
    return new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), parsedDate.getHours(), parsedDate.getMinutes()));
}

const submitForm = async (values: FormValues, securityContext: any) => {
    const data = {
        userData: {
            phoneNumber: values.juniorPhoneNumber,
            lastName: values.juniorLastName,
            firstName: values.juniorFirstName,
            nickName: values.juniorNickName,
            gender: values.juniorGender,
            school: values.school,
            class: values.class,
            communicationsLanguage: values.communicationsLanguage,
            birthday: getParsedBirthday(values.juniorBirthday),
            homeYouthClub: values.youthClub,
            postCode: values.postCode,
            parentsName: `${values.parentFirstName} ${values.parentLastName}`,
            parentsPhoneNumber: values.parentPhoneNumber,
            status: 'pending',
            photoPermission: values.photoPermission === 'y'
        },
        securityContext: securityContext
    };
    return await post('/junior/parent-register', data);
}

interface Props {
  securityContext: any,
  clubs: Club[],
  onSubmit: () => void,
  onError: () => void
}

const RegistrationForm = withFormik<Props, FormValues>({
    mapPropsToValues: props => {
        return {
            juniorFirstName: '',
            juniorLastName: '',
            juniorNickName: '',
            juniorBirthday: '',
            juniorPhoneNumber: '',
            juniorGender: '',
            postCode: '',
            photoPermission: '',
            school: '',
            class: '',
            communicationsLanguage: '',
            parentFirstName: props.securityContext.firstName,
            parentLastName: props.securityContext.lastName,
            parentPhoneNumber: '',
            youthClub: '',
            termsOfUse: false
        }
    },
    enableReinitialize: true,
    mapPropsToStatus: props => {
        return {
            clubs: props.clubs
                .map((youthClub) => ({ value: youthClub.id.toString(), label: youthClub.name }))
                .sort((a,b) => a.label.localeCompare(b.label, 'fi', { sensitivity: 'base' }))
        }
    },
    validationSchema: (): Schema<FormValues> => object().shape({
        juniorFirstName: string().required('required'),
        juniorLastName: string().required('required'),
        juniorNickName: string(),
        juniorBirthday: string().matches(/^(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)\d\d$/, 'birthdayFormat').required('birthdayFormat'),
        juniorPhoneNumber: string().matches(/(^(\+358|0)\d{6,10}$)/, 'phoneNumberFormat').required('required'),
        postCode: string().length(5, 'postCodeFormat').matches(/^[0-9]*$/, 'postCodeFormat').required('required'),
        school: string().required('required'),
        class: string().required('required'),
        juniorGender: string().required('required'),
        photoPermission: string().required('required'),
        parentFirstName: string().required('required'),
        parentLastName: string().required('required'),
        parentPhoneNumber: string().matches(/(^(\+358|0)\d{6,10})/, 'phoneNumberFormat').required('required'),
        youthClub: string().required('selectYouthClub'),
        communicationsLanguage: string().oneOf(['fi', 'sv', 'en']).required('selectLanguage'),
        termsOfUse: boolean().oneOf([true], 'acceptTermsOfUse').required('acceptTermsOfUse')
    }),
    handleSubmit: (values, formikBag) => {
        submitForm(values, formikBag.props.securityContext)
            .then(formikBag.props.onSubmit)
            .catch(formikBag.props.onError);
    },
    validateOnBlur: false,
    validateOnChange: false
})(InnerForm);

export default RegistrationForm;
