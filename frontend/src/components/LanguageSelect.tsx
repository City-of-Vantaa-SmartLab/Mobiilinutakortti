import React, { Fragment } from 'react'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from '../store/getStore'
import { LangTypes } from '../types/langTypes'
import { languages } from '../customizations'

export interface Props {
  color: string
}

export default function LanguageSelect({ color }: Props) {
  const dispatch = useAppDispatch()
  const currentLang = useAppSelector(store => store.lang.lang)
  return (
    <LanguageSelectRoot>
      {languages.map((lang, i) => (
        <Fragment key={lang}>
          <LangButton $color={color} onClick={() => dispatch({ type: LangTypes.SET_LANG, lang })} disabled={lang === currentLang}>{lang}</LangButton>
          {i < languages.length - 1 ? <Gap /> : null}
        </Fragment>
      ))}
    </LanguageSelectRoot>
  )
}

const LanguageSelectRoot = styled.div`
  z-index: 100;
  position: absolute;
  top: 10px;
  right: 40px;
`

const LangButton = styled.button<{ disabled: boolean, $color: string }>`
  background: none;
  border: none;
  outline: none;
  margin: 0;
  padding: 0;
  font-size: 16px;
  color: ${p => p.$color};
  font-weight: bold;
  text-decoration: ${(p) => p.disabled ? 'underline' : 'none'};
  text-transform: uppercase;
`

const Gap = styled.span`
  margin-right: 12px;
`
