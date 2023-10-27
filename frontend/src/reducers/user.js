import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from '../services/auth';

const initialState = JSON.parse(localStorage.getItem('user')) || null;

const userSlice = createSlice({
  name: 'user', // defines the prefix which is used in the action's type values
  initialState,
  /*
  reducers: {
    sigIn(state, action) {
      const user = action.payload;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    },
    signOut() {
      localStorage.removeItem('user');
      return null;
    },
  },
  */
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const user = action.payload;
        // add user to local storage
        localStorage.setItem('user', JSON.stringify(user));

        console.log('login fulfilled');
        return user;
      })
      .addCase(login.rejected, (state, action) => {
        console.log('login rejected');
        return state;
      })

      .addCase(logout.fulfilled, (state, action) => {
        // remove user from local storage
        localStorage.removeItem('user');

        console.log('logout fulfilled');
        return null;
      })
      .addCase(logout.rejected, (state, action) => {
        console.log('logout rejected');
        return state;
      })
  }
});

export const { sigIn, signOut } = userSlice.actions;

export const login = createAsyncThunk(
  'user/login',
  async (credentials, thunkApi) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      return thunkApi.rejectWithValue(error.response.data.message);
    }
  },
);

export const logout = createAsyncThunk(
  'user/logout',
  async (credentials, thunkApi) => {
    try {
      return await authService.logout();
    } catch (error) {
      return thunkApi.rejectWithValue(error.response.data.message);
    }
  },
);

/*
const baseUrl = '/api/auth';

export const login = (credentials) => {
  return async dispatch => {
    const { data } = await axios.post(
      `${baseUrl}/login`,
      credentials,
      { withCredentials: true}
    );

    console.log('login response.data:', data);
    dispatch(sigIn(data));
  };
};

export const logout = () => {
  return async dispatch => {
    const response = await axios.post(
      `${baseUrl}/logout`,
      {},
      { withCredentials: true }
    );

    console.log('logout response:', response);
    dispatch(signOut());
  };
};
*/

export default userSlice.reducer;