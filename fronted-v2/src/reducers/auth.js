import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/auth';
import relationsService from '../services/relations';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  relations: JSON.parse(localStorage.getItem('user')) || [],
};

const authSlice = createSlice({
  name: 'auth', // defines the prefix which is used in the action's type values
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const { user, relations } = action.payload;

        // add user to local storage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('relations', JSON.stringify(relations));
        return { ...state, user, relations };
      })
      .addCase(login.rejected, (state, action) => {
        return state;
      })

      .addCase(logout.fulfilled, (state, action) => {
        // remove user from local storage
        localStorage.removeItem('user');
        localStorage.removeItem('relations');
        return { ...state, user: null, relations: [] };
      })
      .addCase(logout.rejected, (state, action) => {
        return state;
      })

      // add cases for adding/removing authenticated users relations
      // also edit the relations local storage 
  }
});

export const { sigIn, signOut } = authSlice.actions;

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
      const user = await authService.login(credentials);

      // get logged in users relations
      const { relations } = await relationsService.getTargetRelations(user.username);

      return { user, relations };

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
  async (_, thunkApi) => {
    try {
      return await authService.logout();
    } catch (error) {
      return thunkApi.rejectWithValue(error.response.data.message);
    }
  },
);

/*
export const addRelation = createAsyncThunk(
  'auth/addRelation',
  async ({ targetUserId, type }, thunkApi) => {
    try {
      const { username } = thunkApi.getState().auth.user;
      return await relationsService.addRelation(username, targetUserId, type);

    } catch (error) {
      return thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);
*/

export default authSlice.reducer;