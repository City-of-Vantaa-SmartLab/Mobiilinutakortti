import React from 'react';
import { Field, FormikProps, withFormik, FieldProps } from 'formik';
import { string, object, boolean } from 'yup';
import { post } from '../../apis';

import { InputField, DropdownField, SelectGroup } from './FormFields';
import { Form, Column, Fieldset, FieldTitle, Checkbox, FormFooter, Button } from './StyledComponents';


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
    const { handleSubmit, handleReset, touched, errors, status } = props;
    return (           
            <Form onReset={handleReset} onSubmit={handleSubmit}>  
                <Column>
                    <Fieldset>
                        <FieldTitle>Nuoren tiedot</FieldTitle>                      
                        <Field name='juniorFirstName' component={InputField} title='Etunimi'/>
                        <Field name='juniorLastName' component={InputField} title='Sukunimi'/>
                        <Field name='juniorNickName' component={InputField} title='Kutsumanimi'/>
                        <Field name='juniorBirthday' component={InputField} title='Syntymäaika' placeholder='pp.kk.vvvv'/>
                        <Field name='juniorPhoneNumber' component={InputField} title='Puhelinnumero'/>
                        <Field name='postCode' component={InputField} title='Postinumero'/>
                        <Field name='school' component={InputField} title='Koulun nimi'/>
                        <Field name='class' component={InputField} title='Luokka'/>

                        <SelectGroup 
                            error={errors.juniorGender} 
                            touched={touched.juniorGender} 
                            title="Sukupuoli" 
                            name="juniorGender" 
                            options={[{value: 'f', label: 'Tyttö'},{value: 'm', label: 'Poika'},{value: 'o', label: 'Muu'},{value: '-', label: 'En halua määritellä'}]}
                        />

                        <SelectGroup 
                            error={errors.photoPermission} 
                            touched={touched.photoPermission} 
                            title="Kuvauslupa" 
                            name="photoPermission" 
                            description="Valokuvaamme ja videoimme ajoittain toimintaamme ja nuoria viestintää varten. Kuvia voidaan käyttää Nuorisopalveluiden jalkaisuissa (esim. sosiaalisessa mediassa, nettisivuilla ja esitteissä). \nLapseni kuvaa saa käyttää lapsen asuinkaupungin viestinnässä."
                            options={[{value: 'y', label: 'Kyllä'},{value: 'n', label: 'Ei'}]}/>

                    </Fieldset>
                </Column>

                <Column>
                    <Fieldset>
                        <FieldTitle>Huoltajan tiedot</FieldTitle>
                        <Field name='parentFirstName' component={InputField} title='Etunimi'/>
                        <Field name='parentLastName' component={InputField} title='Sukunimi'/>
                        <Field name='parentPhoneNumber' component={InputField} title='Puhelinnumero'/>
                    </Fieldset>

                    <Fieldset>
                        <FieldTitle>Kotinuorisotila</FieldTitle>
                        <Field name='youthClub' 
                            component={DropdownField} 
                            title='Kotinuorisotila' 
                            options={status.clubs}
                            defaultChoice='Valitse nuorisotila'
                            description="Valitse nuorisotila, jossa lapsesi tai nuoresi yleensä käy."
                        />        
                </Fieldset>
            </Column>
            <FormFooter>
                <Field name='termsOfUse'>  
                    {({ field } : FieldProps) => (
                        <div>
                            <Checkbox type='checkbox' checked={field.value} id={field.name} {...field} />
                            <label htmlFor={field.name}>Hyväksyn&#160;<a target='_blank' rel="noopener noreferrer" href='https://www.vantaa.fi/instancedata/prime_product_julkaisu/vantaa/embeds/vantaawwwstructure/150593_Mobiilinutakortin_kayttoehdot.pdf'>käyttöehdot</a></label>
                        </div>
                    )}
                </Field> 
                <Button type="submit" disabled={!props.values.termsOfUse}>Lähetä hakemus</Button>
                <a target='_blank' rel="noopener noreferrer" href="https://www.vantaa.fi/instancedata/prime_product_julkaisu/vantaa/embeds/vantaawwwstructure/148977_Henkilotietojen_kasittely_nuorisopalveluissa.pdf">Lue tarkemmin, kuinka käsittelemme tietojasi.</a>
            </FormFooter>
        </Form>
    )
}

interface RegFormProps {
    parentFirstName?: string,
    parentLastName?: string,
    clubs: any[],
    onSubmit: () => void,
    onError: ()=> void
}

const submitForm = async (values: FormValues) => {
    const birthday = values.juniorBirthday.split('.');
    const data = {
        phoneNumber: values.juniorPhoneNumber,
        lastName: values.juniorLastName,
        firstName: values.juniorFirstName,
        nickName: values.juniorNickName,
        gender: values.juniorGender,
        school: values.school,
        class: values.class,
        birthday: new Date(parseInt(birthday[2]), parseInt(birthday[1])-1, parseInt(birthday[0])),
        homeYouthClub: values.youthClub,
        postCode: values.postCode,
        parentsName: `${values.parentFirstName} ${values.parentLastName}`,
        parentsPhoneNumber: values.parentPhoneNumber,
        status: 'p',
        photoPermission: values.photoPermission === 'y'
    };
        const response = await post('/junior/register', data);
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
            parentFirstName: '',
            parentLastName: '',
            parentPhoneNumber: '',
            youthClub: '',
            termsOfUse: false
        }
    },
    enableReinitialize: true,
    mapPropsToStatus: props => {
        return {
            clubs: props.clubs.map(club => club.name)
        }   
    },
    validationSchema: object().shape({
                juniorFirstName: string().required("Täytä tiedot"),
                juniorLastName: string().required("Täytä tiedot"),
                juniorNickName: string(),
                juniorBirthday: string().matches(/^(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)\d\d$/, 'Anna syntymäaika muodossa pp.kk.vvvv').required('Anna syntymäaika muodossa pp.kk.vvvv'), 
                juniorPhoneNumber: string().matches(/(^(\+358|0)\d{9}$)/, 'Tarkista, että antamasi puhelinnumero on oikein').required("Täytä tiedot"),
                postCode: string().length(5, 'Tarkista, että antamasi postinumero on oikein').matches(/^[0-9]*$/, 'Tarkista, että antamasi postinumero on oikein').required("Täytä tiedot"),
                school: string().required("Täytä tiedot"),
                class: string().required("Täytä tiedot"),
                juniorGender: string().required("Täytä tiedot"),
                photoPermission: string().required("Täytä tiedot"),
                parentFirstName: string().required("Täytä tiedot"),
                parentLastName: string().required("Täytä tiedot"),
                parentPhoneNumber: string().matches(/(^(\+358|0)\d{9})/, 'Tarkista, että antamasi puhelinnumero on oikein').required("Täytä tiedot"),
                youthClub: string().required("Valitse kotinuorisotila valikosta"),
                termsOfUse: boolean().required()
            }),
    handleSubmit: (values, formikBag) => {
        submitForm(values)
            .then(formikBag.props.onSubmit)
            .catch(formikBag.props.onError);      
    },
    validateOnBlur: false,
    validateOnChange: false
})(InnerForm);

export default RegistrationForm;