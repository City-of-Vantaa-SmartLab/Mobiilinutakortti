import React from 'react';
import { Field, FormikProps, withFormik, FieldProps } from 'formik';
import { string, object, boolean } from 'yup';
import { post } from '../../../apis';

import { InputField, DropdownField, SelectGroup } from './FormFields';
import { Form, Column, Fieldset, FieldTitle, Checkbox, FormFooter, Button, ErrorMessage } from '../StyledComponents';
import { useTranslations } from '../../translations'


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
    parentFirstName: string,
    parentLastName: string,
    parentPhoneNumber: string,
    youthClub: string,
    termsOfUse: boolean
}

const InnerForm = (props: FormikProps<FormValues>) => {
    const t = useTranslations()
    const { handleSubmit, handleReset, touched, errors, status } = props;
    return (
            <Form onReset={handleReset} onSubmit={handleSubmit} autoComplete={`off-random-${Math.random()}`}>
                <Column>
                    <Fieldset>
                        <FieldTitle>Nuoren tiedot</FieldTitle>
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
                        <FieldTitle>Huoltajan tiedot</FieldTitle>
                        <Field disabled name='parentFirstName' component={InputField} title={t.parentRegistration.form.parentFirstName} />
                        <Field disabled name='parentLastName' component={InputField} title={t.parentRegistration.form.parentLastName} />
                        <Field name='parentPhoneNumber' component={InputField} type='phone' title={t.parentRegistration.form.parentPhoneNumber} />
                    </Fieldset>

                    <Fieldset>
                        <FieldTitle>{t.parentRegistration.form.youthClubHeading}</FieldTitle>
                        <Field
                            name='youthClub'
                            component={DropdownField}
                            title={t.parentRegistration.form.youthClub}
                            options={status.clubs}
                            defaultChoice={t.parentRegistration.form.youthClubDefault}
                            description={t.parentRegistration.form.youthClubDescription}
                        />
                </Fieldset>
            </Column>
            <FormFooter>
                <Field name='termsOfUse'>
                    {({ field } : FieldProps) => (
                        <div>
                            <Checkbox type='checkbox' checked={field.value} id={field.name} {...field} />
                            <label htmlFor={field.name}>{t.parentRegistration.form.termsOfUse}</label>
                        </div>
                    )}
                </Field>
                <ErrorMessage>{errors['termsOfUse']}</ErrorMessage>
                <Button type="submit">{t.parentRegistration.form.submit}</Button>
                {t.parentRegistration.form.termsOfUse}
            </FormFooter>
        </Form>
    )
}

interface RegFormProps {
    securityContext: any,
    clubs: any[],
    onSubmit: () => void,
    onError: ()=> void
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
        const response = await post('/junior/parent-register', data);
        return response;
}

const RegistrationForm = withFormik<RegFormProps, FormValues>({

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
    validationSchema: object().shape({
                juniorFirstName: string().required("Täytä tiedot"),
                juniorLastName: string().required("Täytä tiedot"),
                juniorNickName: string(),
                juniorBirthday: string().matches(/^(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)\d\d$/, 'Anna syntymäaika muodossa pp.kk.vvvv').required('Anna syntymäaika muodossa pp.kk.vvvv'),
                juniorPhoneNumber: string().matches(/(^(\+358|0)\d{6,10}$)/, 'Tarkista, että antamasi puhelinnumero on oikein').required("Täytä tiedot"),
                postCode: string().length(5, 'Tarkista, että antamasi postinumero on oikein').matches(/^[0-9]*$/, 'Tarkista, että antamasi postinumero on oikein').required("Täytä tiedot"),
                school: string().required("Täytä tiedot"),
                class: string().required("Täytä tiedot"),
                juniorGender: string().required("Täytä tiedot"),
                photoPermission: string().required("Täytä tiedot"),
                parentFirstName: string().required("Täytä tiedot"),
                parentLastName: string().required("Täytä tiedot"),
                parentPhoneNumber: string().matches(/(^(\+358|0)\d{6,10})/, 'Tarkista, että antamasi puhelinnumero on oikein').required("Täytä tiedot"),
                youthClub: string().required("Valitse kotinuorisotila valikosta"),
                termsOfUse: boolean().oneOf([true], 'Hyväksy käyttöehdot jatkaaksesi').required('Hyväksy käyttöehdot jatkaaksesi')
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
