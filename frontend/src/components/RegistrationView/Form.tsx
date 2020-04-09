import React from 'react';
import { Field, FormikProps, withFormik } from 'formik';
import styled from 'styled-components';
import { string, object } from 'yup';

import { InputField, DropdownField, SelectGroup } from './FormFields';


const Form = styled.form`
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    margin: 0 auto;
    justify-content: center;
    width: 100%;
`;

const Fieldset = styled.div`
    box-sizing: border-box;
    border: 0;
    background: white;
    padding: 1.5em 1.5em;
    margin: 1.5em 0 0; 
    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.25);

    & > span {
        font-size: 0.8em;
        display: inline-block;
    }

    @media (max-width: 700px) {
        flex-basis: 100%;
        margin: 1em 1em 0;
    }
`;

const Button = styled.button`
    font-family: 'GT-Walsheim';
    text-transform: uppercase;
    background: #3c8fde;
    border: none;
    color: #fff;
    padding: 1em;
    margin-bottom: 1.5em;
    font-size: 1em;
    font-weight: 600;
    &:focus {
        outline: None;
    }
    &:active {
        background: #0042a5;
    }
`;

const FieldTitle = styled.h2`
    color: #0042a5;
    margin: 0;
    font-weight: 600;
`;

const FormFooter = styled.div`
    width: 100%;
    padding: 2rem;
    margin-top: 1.5rem;
    background: rgb(249, 229, 30);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    & > a {
        display: block;
    }
`;

const Column = styled.div`
    flex-basis: 50%;
    display: flex;
    flex-direction: column;
    margin: 0;
    box-sizing: border-box;
    padding: 1em;
    justify-content: flex-start;
    max-width: 400px;
    @media (max-width: 700px) {
        flex-basis: 100%;
        padding: 0;
    }
`;

export interface FormValues {
    juniorFirstName: string,
    juniorLastName: string,
    juniorNickName: string,
    juniorBirthday: string,
    juniorPhoneNumber: string,
    juniorGender: string,
    postalCode: string,
    kuvauslupa: string,
    school: string,
    class: string,
    parentFirstName: string,
    parentLastName: string,
    parentPhoneNumber: string,

    youthClub: string
}


const InnerForm = (props: FormikProps<FormValues>) => {  
    const { handleSubmit, handleReset, values, touched, errors } = props;
    console.log(values);
    return (           
            <Form onReset={handleReset} onSubmit={handleSubmit}>  

                <Column>
                    <Fieldset>
                        <FieldTitle>Nuoren tiedot</FieldTitle>                      
                        <Field name='juniorFirstName' component={InputField} title='Etunimi'/>
                        <Field name='juniorLastName' component={InputField} title='Sukunimi'/>
                        <Field name='juniorNickName' component={InputField} title='Kutsumanimi'/>
                        <Field name='juniorBirthday' component={InputField} title='Syntymäaika' placeholder='pp/kk/vvvv'/>
                        <Field name='juniorPhoneNumber' component={InputField} title='Puhelinnumero'/>
                        <Field name='postalCode' component={InputField} title='Postinumero'/>
                        <Field name='school' component={InputField} title='Koulun nimi'/>
                        <Field name='class' component={InputField} title='Luokka'/>

                        <SelectGroup 
                            error={errors.juniorGender} 
                            touched={touched.juniorGender} 
                            title="Sukupuoli" 
                            name="juniorGender" 
                            options={['Tyttö', 'Poika', 'Muu', 'En halua määritellä']}
                        />

                        <SelectGroup 
                            error={errors.kuvauslupa} 
                            touched={touched.kuvauslupa} 
                            title="Kuvauslupa" 
                            name="kuvauslupa" 
                            description="Valokuvaamme ja videoimme ajoittain toimintaamme ja nuoria viestintää varten. Kuvia voidaan käyttää Nuorisopalveluiden jalkaisuissa (esim. sosiaalisessa mediassa, nettisivuilla ja esitteissä). \nLapseni kuvaa saa käyttää lapsen asuinkaupungin viestinnässä."
                            options={['Kyllä', 'Ei']}/>

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
                            options={['club1', 'club2', 'club3']}
                            defaultChoice='Kannu'
                            description="Valitse nuorisotila, jossa lapsesi tai nuoresi yleensä käy."
                        />      
                </Fieldset>
            </Column>
            <FormFooter>
                <Button type="submit">Lähetä hakemus</Button>
                <a href="#">Lue tarkemmin, kuinka käsitelemme tietojasi.</a>
            </FormFooter>
        </Form>
    )
}

interface RegFormProps {
    parentFirstName?: string,
    parentLastName?: string,
    onSubmit: () => void,
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
            postalCode: '',
            kuvauslupa: '',
            school: '',
            class: '',
            parentFirstName: '',
            parentLastName: '',
            parentPhoneNumber: '',
            youthClub: ''
        }
    },
    validationSchema: object().shape({
                juniorFirstName: string().required("Täytä tiedot"),
                juniorLastName: string().required("Täytä tiedot"),
                juniorNickName: string(),
                juniorBirthday: string().matches(/^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/, 'Anna syntymäaika muodossa pp/kk/vvvv').required('Anna syntymäaika muodossa pp/kk/vvvv'), 
                juniorPhoneNumber: string().matches(/(^(\+358|0|358)\d{9})/, 'Tarkista, että antamasi puhelinnumero on oikein').required("Täytä tiedot"),
                postalCode: string().length(5, 'Tarkista, että antamasi postinumero on oikein').matches(/^[0-9]*$/, 'Tarkista, että antamasi postinumero on oikein').required("Täytä tiedot"),
                school: string().required("Täytä tiedot"),
                class: string().required("Täytä tiedot"),
                juniorGender: string().required("Täytä tiedot"),
                kuvauslupa: string().required("Täytä tiedot"),
                parentFirstName: string().required("Täytä tiedot"),
                parentLastName: string().required("Täytä tiedot"),
                parentPhoneNumber: string().matches(/(^(\+358|0|358)\d{9})/, 'Tarkista, että antamasi puhelinnumero on oikein').required("Täytä tiedot"),
                youthClub: string().required("Valitse kotinuorisotila valikosta")
            }),
    handleSubmit: (values, formikBag) => {
        console.log(values);
        formikBag.props.onSubmit();
        
    },
    validateOnBlur: false,
    validateOnChange: false
})(InnerForm);

export default RegistrationForm;