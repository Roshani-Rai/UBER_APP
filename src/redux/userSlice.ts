
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'


type VideoKycStatus=
"not_required" |
"pending" |
"in_progress" | 
"approved" |
"rejected"

export interface IUser {
  _id?: string
  name: string
  email: string
  partnerStep:number
  mobileNumber?: string 
  role: "user" | "partner" | "admin"
  isEmailVerified: boolean
  rejectionReason:string
  partnerStatus:"pending" | "approved" | "rejected"
  createdAt?: Date
  updatedAt?: Date
  videoKycStatus:VideoKycStatus,
    videoKycRoomId:string,
    videoKycRejectionReason:string,
}
// Define a type for the slice state
interface IuserState {
  userData: IUser | null
}

// Define the initial state using that type
const initialState: IuserState = {
  userData: null,
}

export const userSlice = createSlice({
  name: 'user',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setUserData :(state,action)=>{
        state.userData=action.payload
    }

  },
})

export const { setUserData  } = userSlice.actions

export default userSlice.reducer