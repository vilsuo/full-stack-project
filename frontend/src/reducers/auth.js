import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from '../services/auth';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null
};

const userSlice = createSlice({
  name: 'auth', // defines the prefix which is used in the action's type values
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const user = action.payload;
        // add user to local storage
        localStorage.setItem('user', JSON.stringify(user));

        console.log('login fulfilled');
        return { ...state, user };
      })
      .addCase(login.rejected, (state, action) => {
        console.log('login rejected');
        return state;
      })

      .addCase(logout.fulfilled, (state, action) => {
        // remove user from local storage
        localStorage.removeItem('user');

        console.log('logout fulfilled');
        return { ...state, user: null };
      })
      .addCase(logout.rejected, (state, action) => {
        console.log('logout rejected');
        return state;
      })
  }
});

export const { sigIn, signOut } = userSlice.actions;

export const login = createAsyncThunk(
  // A string that will be used to generate additional Redux action type constants, 
  // representing the lifecycle of an async request:
  // pending: 'user/login/pending'
  // fulfilled: 'user/login/fulfilled'
  // rejected: 'user/login/rejected'
  'auth/login',

  // PAYLOAD CREATOR
  // A callback function that should return a promise containing the result of some
  // asynchronous logic
  //
  // If there is an error, it should either return a rejected promise containing one of
  // - an Error instance
  // - a plain value such as a descriptive error message 
  // - a resolved promise with a RejectWithValue argument as returned by the
  //   thunkAPI.rejectWithValue function.
  //
  // Will be called with two arguments
  // 1) a single value, containing the first parameter that was passed to the thunk action
  //    creator when it was dispatched
  // 2) thunkAPI: an object containing all of the parameters that are normally passed to a
  //    Redux thunk function
  async (credentials, thunkApi) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      // utility function that you can return (or throw) in your action creator to return a
      // rejected response with a defined payload and meta. It will pass whatever value you
      // give it and return it in the payload of the rejected action
      return thunkApi.rejectWithValue(error.response.data.message);
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (credentials, thunkApi) => {
    try {
      return await authService.logout();
    } catch (error) {
      return thunkApi.rejectWithValue(error.response.data.message);
    }
  },
);

export default userSlice.reducer;