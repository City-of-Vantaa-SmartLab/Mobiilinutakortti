import { Theme } from './customizations/types'

declare module 'styled-components' {
    export interface DefaultTheme extends Theme {}
}
