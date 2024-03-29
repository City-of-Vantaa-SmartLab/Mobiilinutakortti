import { userTypes, userActions, userState, Status } from '../types/userTypes';

const initialState: userState = {
    id: '',
    name: '',
    status: Status.pending
}

const defaultExp = (state = initialState, action: userActions): userState => {
    switch (action.type) {
        case userTypes.GET_SELF_SUCCESS:
            return { ...state, id: action.payload.id, name: action.payload.name, status: action.payload.status };
        default:
            return state;
    }
}

export default defaultExp
