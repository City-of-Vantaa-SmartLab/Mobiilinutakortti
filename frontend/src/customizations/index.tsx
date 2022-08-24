import React from 'react'
import { Language, Theme } from './types'
import styled from 'styled-components'

export const languages: Language[] = ['fi', 'sv', 'en']

const TopLogo = styled(function TopLogo({ className }: { className?: string }) {
  return <h2 className={className}>Vantaa</h2>
})`
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
`;

const black = '#000000'
const white = '#ffffff'
const darkBlue = '#0042a5'
const lightBlue = '#84ccf8'
const mediumBlue = '#3c8fde'
const yellow = '#f9e51f'

export const theme: Theme = {
  pages: {
    login: {
      logo: null,
      stripe1: darkBlue,
      stripe2: lightBlue,
      background: mediumBlue,
      languageSelectText: white,
      headingText: yellow,
      messageText: '#99e6ff',
      errorText: yellow,
      labelText: white,
      buttonBackground: yellow,
      buttonText: black,
      bottomLogo: null,
    },
    qr: {
      stripe: mediumBlue,
      background: white,
      languageSelectText: black,
      headingText: yellow,
      qrBorder: yellow,
      footerText: black,
    },
    parentRedirect: {
      logo: <TopLogo />,
      stripe1: mediumBlue,
      stripe2: darkBlue,
      background: white,
      languageSelectText: white,
      headingText: white,
      ingressText: white,
      description: {
        background: yellow,
        text: black,
        buttonBackground: mediumBlue,
        buttonText: white,
        bottomLogo: null,
      }
    },
    registration: {
      stripe: darkBlue,
      background: white,
      languageSelectText: white,
      headingText: yellow,
      formTitleText: darkBlue,
      footerBackground: yellow,
      submitButtonBackground: mediumBlue,
      submitButtonText: white,
      errorButtonBackground: mediumBlue,
      errorButtonText: white,
      confirmationBackground: white,
      confirmationTitle: black,
      confirmationLink: darkBlue,
      bottomLogo: null,
    }
  },
  fonts: {
    heading: "GT-Walsheim, sans-serif",
    body: "GT-Walsheim, sans-serif",
  }
}
