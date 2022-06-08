import { Theme } from './customizations'

declare module 'styled-components' {
    export interface DefaultTheme extends Theme {}
}
