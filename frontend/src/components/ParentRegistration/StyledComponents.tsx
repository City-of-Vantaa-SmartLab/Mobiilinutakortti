import styled from 'styled-components';

// Registration view components

export const Wrapper = styled.div`
    background: linear-gradient(-10deg, transparent, transparent 55%, #0042a5 calc(55% + 1px), #0042a5);
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
    text-align: center;
    color: rgb(249, 229, 30);
    font-size: 3em;
    margin: 1.5em 0.5em 0;
`;

export const LogoutLink = styled.span`
    cursor: pointer;
    color: #0042a5;
    font-weight: bold;
`;

export const Confirmation = styled.div`
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
    font-family: 'GT-Walsheim';
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
    float: right;
    margin: 1em 1em 0 0;
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

export const FieldTitle = styled.h2`
    color: #0042a5;
    margin: 0;
    font-weight: 600;
`;

export const FormFooter = styled.div`
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
    -moz-appearance: non
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

// Main view components ('about' page)

export const MainWrapper = styled.div`
    height: 100%;
    width: 100%;
    background: linear-gradient(-5deg, white, white 40%, #0042a5 calc(40% + 1px), #0042a5);
    padding: 0;
    display: flex;
    position: fixed;
    overflow: scroll;
    flex-direction: column;
    @media (max-width: 450px) {
        font-size: 14px;
    }
    @media (min-width: 1150px) {
        font-size: 18px;
    }
`;

export const Logo = styled.div`
    color: white;
    height: calc(100px + 8vw);
    min-height: calc(100px + 8vw);
    width: 100%;
    background: linear-gradient(5deg, transparent, transparent 40%, #3c8fde calc(40% + 1px), #3c8fde);
    position: relative;
    box-sizing: border-box;
    @media (min-width: 2015px) {
        background: linear-gradient(3deg, transparent, transparent 40%, #3c8fde calc(40% + 1px), #3c8fde);
        height: calc(100px + 6vw);
    }
    & > h2 {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 2rem;
        font-size: 2em;
        padding-top: 0.5em;
        @media (max-width: 450px) {
            margin-bottom: 3em;
        }
        @media (min-width: 1050px) {
            font-size: 2.5em;
            padding-top: 1.5vw;
        }
    }
`;

export const MainHeader = styled.header`
    & > h1 {
        text-transform: uppercase;
        margin: 0;
        font-size: 3em;
        line-height: 50px;
        font-family: 'GT-Walsheim';
        color: white;
    }
    & > p {
        color: white;
        margin: 0.5rem 0 1.5rem;
        font-weight: 600;
        font-size: 1.1em;
    }
`;

export const MainDescription = styled.div`
    background: rgb(249, 229, 30);
    padding: 1.5em;
    font-sise: 1em;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.25);
    & > p {
        margin: 0;
    }
`;

export const MainContent = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem 2rem;

`;
