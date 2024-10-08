import React from 'react';
import { Field, FormikProps, withFormik, FieldProps } from 'formik';
import { string, object, boolean, Schema, number } from 'yup';
import { post } from '../../../apis';

import { InputField, DropdownField, SelectGroup } from './FormFields';
import { Form, Column, Fieldset, FieldTitle, Checkbox, FormFooter, Button, ErrorMessage, FieldInfoText } from '../StyledComponents';
import { useTranslations } from '../../translations'
import { CustomizableFormField, Translations } from "../../../customizations/types";
import { hiddenFormFields, languages } from '../../../customizations'
import styled, { useTheme } from 'styled-components'
import { Status } from '../../../types/userTypes';

export interface Club {
    id: number
    name: string
}

export interface FormValues {
    juniorFirstName: string,
    juniorLastName: string,
    juniorNickName?: string,
    juniorBirthday: string,
    juniorPhoneNumber: string,
    smsPermissionJunior: string,
    juniorGender: string,
    postCode?: string,
    photoPermission: string,
    school?: string,
    class?: string,
    communicationsLanguage?: string
    parentFirstName: string,
    parentLastName: string,
    parentPhoneNumber: string,
    smsPermissionParent: string,
    parentsEmail?: string,
    emailPermissionParent?: string,
    additionalContactInformation?: string,
    youthClub: number,
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
                        {valueOrNull('juniorNickName', <Field name='juniorNickName' component={InputField} title={t.parentRegistration.form.juniorNickName} />)}
                        <Field name='juniorBirthday' component={InputField} title={t.parentRegistration.form.juniorBirthday} placeholder={t.parentRegistration.form.juniorBirthdayPlaceholder} />
                        <Field name='juniorPhoneNumber' component={InputField} type='phone' title={t.parentRegistration.form.juniorPhoneNumber} />
                        {valueOrNull('postCode', <Field name='postCode' component={InputField} title={t.parentRegistration.form.postCode} />)}
                        {valueOrNull('school', <Field name='school' component={InputField} title={t.parentRegistration.form.school} />)}
                        {valueOrNull('class', <Field name='class' component={InputField} title={t.parentRegistration.form.class} />)}

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

                    {valueOrNull('communicationsLanguage', (
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
                    ))}
                </Column>

                <Column>
                    <Fieldset>
                        <FieldTitle>{t.parentRegistration.form.parentHeading}</FieldTitle>
                        <Field disabled name='parentFirstName' component={InputField} title={t.parentRegistration.form.parentFirstName} />
                        <Field disabled name='parentLastName' component={InputField} title={t.parentRegistration.form.parentLastName} />
                        <Field name='parentPhoneNumber' component={InputField} type='phone' title={t.parentRegistration.form.parentPhoneNumber} />
                        <Field name='parentsEmail' component={InputField} type='email' title={t.parentRegistration.form.parentsEmail} />
                        <Field name='additionalContactInformation' component={InputField} type='phone' title={t.parentRegistration.form.additionalContactInformation} />
                    </Fieldset>

                    <Fieldset>
                        <FieldTitle>{t.parentRegistration.form.announcements.title}</FieldTitle>
                        <FieldInfoText>{t.parentRegistration.form.announcements.description}</FieldInfoText>
                        <SelectGroup
                            error={errors.smsPermissionJunior}
                            touched={touched.smsPermissionJunior}
                            title={t.parentRegistration.form.announcements.smsPermission}
                            name="smsPermissionJunior"
                            description={t.parentRegistration.form.announcements.smsPermissionJunior}
                            options={[
                              { value: 'smsJuniorOk', label: t.parentRegistration.form.announcements.permissionOptions.ok },
                              { value: 'smsJuniorNotOk', label: t.parentRegistration.form.announcements.permissionOptions.notOk }
                            ]}
                        />
                        <SelectGroup
                            error={errors.smsPermissionParent}
                            touched={touched.smsPermissionParent}
                            name="smsPermissionParent"
                            description={t.parentRegistration.form.announcements.smsPermissionParent}
                            options={[
                              { value: 'smsParentOk', label: t.parentRegistration.form.announcements.permissionOptions.ok },
                              { value: 'smsParentNotOk', label: t.parentRegistration.form.announcements.permissionOptions.notOk }
                            ]}
                        />
                        <SelectGroup
                            error={errors.emailPermissionParent}
                            touched={touched.emailPermissionParent}
                            title={t.parentRegistration.form.announcements.emailPermission}
                            name="emailPermissionParent"
                            description={t.parentRegistration.form.announcements.emailPermissionParent}
                            options={[
                              { value: 'emailParentOk', label: t.parentRegistration.form.announcements.permissionOptions.ok },
                              { value: 'emailParentNotOk', label: t.parentRegistration.form.announcements.permissionOptions.notOk }
                            ]}
                        />
                    </Fieldset>

                    <Fieldset>
                        <FieldTitle>{t.parentRegistration.form.youthClubHeading}</FieldTitle>
                        <Field
                            name='youthClub'
                            component={DropdownField}
                            optionType='number'
                            title={t.parentRegistration.form.youthClubHeading}
                            options={status.clubs}
                            defaultChoice={t.parentRegistration.form.youthClubDefault}
                            description={t.parentRegistration.form.youthClubDescription}
                        />
                    </Fieldset>

                </Column>
                <FormFooter>
                    {valueOrNull('termsOfUse', (
                        <>
                            <Field name='termsOfUse'>
                                {({ field }: FieldProps) => (
                                  <div>
                                    <Checkbox type='checkbox' checked={field.value} id={field.name} {...field} />
                                    <label htmlFor={field.name}>{t.parentRegistration.form.termsOfUse}</label>
                                  </div>
                                )}
                            </Field>
                            <ErrorMessage>{errors.termsOfUse && t.parentRegistration.errors[errors.termsOfUse as ErrorKey]}</ErrorMessage>
                        </>
                    ))}
                    <p>{t.parentRegistration.form.correctNote}</p>
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
            smsPermissionJunior: values.smsPermissionJunior === 'smsJuniorOk',
            lastName: values.juniorLastName,
            firstName: values.juniorFirstName,
            nickName: values.juniorNickName,
            gender: values.juniorGender,
            school: values.school,
            class: values.class,
            communicationsLanguage: values.communicationsLanguage || 'fi',
            birthday: getParsedBirthday(values.juniorBirthday),
            homeYouthClub: values.youthClub,
            postCode: values.postCode,
            parentsName: `${values.parentFirstName} ${values.parentLastName}`,
            parentsPhoneNumber: values.parentPhoneNumber,
            smsPermissionParent: values.smsPermissionParent === 'smsParentOk',
            parentsEmail: values.parentsEmail,
            emailPermissionParent: values.emailPermissionParent === 'emailParentOk',
            additionalContactInformation: values.additionalContactInformation,
            status: Status.pending,
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
            smsPermissionJunior: '',
            juniorGender: '',
            postCode: '',
            photoPermission: '',
            school: '',
            class: '',
            communicationsLanguage: '',
            parentFirstName: props.securityContext.firstName,
            parentLastName: props.securityContext.lastName,
            parentPhoneNumber: '',
            smsPermissionParent: '',
            parentsEmail: '',
            emailPermissionParent: '',
            additionalContactInformation: '',
            youthClub: 0,
            termsOfUse: hiddenFormFields.includes('termsOfUse'),
        }
    },
    enableReinitialize: true,
    mapPropsToStatus: props => {
        return {
            clubs: props.clubs
                .map((youthClub) => ({ value: youthClub.id, label: youthClub.name }))
                .sort((a,b) => a.label.localeCompare(b.label, 'fi', { sensitivity: 'base' }))
        }
    },
    validationSchema: (): Schema<FormValues> => object().shape({
        juniorFirstName: string().required('required'),
        juniorLastName: string().required('required'),
        juniorNickName: string(),
        juniorBirthday: string().matches(/^(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)\d\d$/, 'birthdayFormat').required('birthdayFormat'),
        juniorPhoneNumber: string().matches(/(^(\+358|0)\d{6,10}$)/, 'phoneNumberFormat').required('required'),
        smsPermissionJunior: string().oneOf(['smsJuniorOk', 'smsJuniorNotOk']).required('required'),
        postCode: valueOr('postCode', string().length(5, 'postCodeFormat').matches(/^[0-9]*$/, 'postCodeFormat').required('required'), string()),
        school: valueOr('school', string().required('required'), string()),
        class: valueOr('class', string().required('required'), string()),
        juniorGender: string().required('required'),
        photoPermission: string().required('required'),
        parentFirstName: string().required('required'),
        parentLastName: string().required('required'),
        parentPhoneNumber: string().matches(/(^(\+358|0)\d{6,10})/, 'phoneNumberFormat').required('required'),
        smsPermissionParent: string().oneOf(['smsParentOk', 'smsParentNotOk']).required('required'),
        parentsEmail: string().matches(/^\S+@\S+\.\S+$/, 'emailFormat'),
        emailPermissionParent: string().oneOf(['emailParentOk', 'emailParentNotOk']),
        additionalContactInformation: string(),
        youthClub: number().integer().required('selectYouthClub').notOneOf([0], 'required'),
        communicationsLanguage: valueOr('communicationsLanguage', string().oneOf(['fi', 'sv', 'en']).required('selectLanguage'), string()),
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

function valueOr<T>(name: CustomizableFormField, visibleValue: T, hiddenValue: T): T {
  return hiddenFormFields.includes(name) ? hiddenValue : visibleValue;
}

function valueOrNull<T>(name: CustomizableFormField, visibleValue: T): T | null {
  return valueOr(name, visibleValue, null)
}

export default RegistrationForm;
