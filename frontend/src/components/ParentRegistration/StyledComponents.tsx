import styled from 'styled-components';

// Registration view components

export const Wrapper = styled.div`
    background: linear-gradient(-10deg, transparent, transparent 55%, ${p => p.theme.pages.registration.stripe} calc(55% + 1px), ${p => p.theme.pages.registration.stripe});
    width: 100%;
    height: 100%;
    position: fixed;
    overflow: scroll;
    @media (max-width: 450px) {
        font-size: 14px;
    }
    @media (min-height: 1150px) {
        font-size: 19px;
    }
`;

export const Header = styled.h1`
    font-family: ${p => p.theme.fonts.heading};
    text-align: center;
    color: ${p => p.theme.pages.registration.headingText};
    font-size: 3em;
    margin: 1.5em 0.5em 0;
`;

export const Confirmation = styled.div`
    margin: auto;
    max-width: 800px;

    padding: 2em;
    & > div {
        background: ${p => p.theme.pages.registration.confirmationBackground};
        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.25);
        padding: 2em;
        & > h2 {
            margin-top: 0;
            color: ${p => p.theme.pages.registration.confirmationTitle};
        }
    }
`;

export const SuccessIcon = styled.div`
    margin: 2em 0;
    &:before {
        content: '\f06d';
        font-family: 'fontello';
        display: block;
        color: #4a7829;
        font-size: 10em;
        text-align: center;
    }
`;

export const Error = styled.div`
    margin: auto;
    max-width: 800px;

    padding: 2em;
    & > div {
        background: #fff;
        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.25);
        padding: 2em;
        & > h2 {
            margin-top: 0;
            color: #0042a5;
        }
    }
`;

export const Button = styled.button`
    font-family: ${p => p.theme.fonts.body};
    text-transform: uppercase;
    background: #3c8fde;
    border: none;
    cursor: pointer;
    color: #fff;
    padding: 1em 2em;
    margin: 1.5em 0;
    font-size: 1em;
    font-weight: 600;
    position: relative;
    overflow: hidden;
    &:before {
        top: 50%;
        left:50%;
        content: '';
        position: absolute;
        width: 200px;
        height: 200px;
        transform: translate(-50%, -50%) scale(0);
        transform-origin: center center;
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 50%;
    }
    &:hover {
        &:before {
            transform: translate(-50%, -50%) scale(1.5);
            transition: all 0.3s ease-in;
        }
    }
    &:active {
        transform:translate(0,1px);
        transition: all 0.3s ease-in-out;
        background: #0042a5;
        }
    &:focus {
        outline: None;
        }
    &:disabled {
        opacity: 0.8;
    }
`;

export const LogoutButton = styled(Button)`
    margin: 1em;
`;

//Form components

export const Form = styled.form`
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    margin: 0 auto;
    justify-content: center;
    width: 100%;
`;

export const Column = styled.div`
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

export const Fieldset = styled.div`
    box-sizing: border-box;
    border: 0;
    background: ${p => p.theme.pages.registration.background};
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

export const FieldTitle = styled.h2`
    color: ${p => p.theme.pages.registration.formTitleText};
    margin: 0;
    font-weight: 600;
`;

export const FormFooter = styled.div`
    width: 100%;
    padding: 2rem;
    margin-top: 1.5rem;
    background: ${p => p.theme.pages.registration.footerBackground};
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    & > a {
        display: block;
        font-size: 0.8em;
    }
`;

// Field components

export const Label = styled.label`
    color: #000;
    font-size: 1em;
    display: inline-block;
    padding: 1em 0 0.3em;
`;

export const ErrorMessage = styled.div`
    color: red;
    padding-top: 0.3em;
    font-size: 0.8em;
`;

export const Description = styled.div`
    font-size: 0.8em;
    white-space: pre-wrap;
`

export const Input = styled.input`
    display: block;
    width: 100%;
    padding: 1em;
    border: 1px solid #000;
    box-sizing: border-box;
    box-shadow: 0;
    border-radius: 0;
    -webkit-appearance: none;
    -moz-appearance: none;
    &:focus {
        outline: none;
    }
`;

export const Select = styled.div`
    width: 100%;
    display: flex;
    padding: 1em 0 0.5em;
`;

export const SelectOption = styled.div`
    display: inline-block;
    margin-right: 0.3em;
`;

export const Radio = styled.input.attrs({type: 'radio'})`
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

export const SelectLabel = styled.label`
    display: inline-block;
    font-size: 0.8em;
`;

export const Dropdown = styled.div`
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
        font-family: ${p => p.theme.fonts.body};

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

export const Checkbox = styled.input.attrs({type: 'checkbox'})`

&:checked, &:not(:checked) {
    position: absolute;
    visibility: hidden;
}
& + label{
    font-size: 0.8em;
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
    // justify-content: center;
}

& + label:before {
    content: '';
    position: absolute;
    left: 0;
    width: 18px;
    height: 18px;
    // border: 1px solid #000;
    background: #fff;
}
&:checked + label:before {
    background: #3c8fde;
}
&:checked + label:after, &:not(:checked) + label:after {
    content: '';
    left: 6px;
    top: calc(50% - 7px);
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 1px 1px 0;
    transform: rotate(45deg);
    position: absolute;
}
&:not(:checked) + label:after {
    opacity: 0;
}
`;
