import styled from 'styled-components'

const LoadingMessageContainer = styled.div`
    text-align: center;
    font-size: 2em;
`
const LoadingMessage = ({message}: {message: string}) => {
    return (
        <LoadingMessageContainer>
            <h3>{message}</h3>
        </LoadingMessageContainer>
    )
}

export default LoadingMessage
