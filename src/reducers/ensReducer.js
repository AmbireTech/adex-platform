import { UPDATE_ENS_RESOLUTION, UPDATE_ENS_RESOLUTION_ERROR } from "../constants/actionTypes"
import initialState from "store/initialState"
export default function ensReducer(state = initialState.ens, action) {
	switch (action.type) {
	case UPDATE_ENS_RESOLUTION:
		return {
			...state,
			ensName: action.ensName,
			address: action.address,
			error: action.error
	  };
	case UPDATE_ENS_RESOLUTION_ERROR:
		return {
			...state,
			error: action.error,
			ensName: action.ensName,
			address: action.address
		}
	default:
		return state;
	}
}
