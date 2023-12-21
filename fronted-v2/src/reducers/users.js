import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import usersService from '../services/users';

const initialState = {};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action) => {
      const newUser = action.payload;
      state[newUser.username] = newUser;
    },
    addUsers: (state, action) => {
      const newUsers = action.payload;
      newUsers.forEach(newUser => state[newUser.username] = newUser);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.fulfilled, (state, action) => {
        const newUser = action.payload;
        state[newUser.username] = newUser;
      })
      .addCase(loadUser.rejected, (state, action) => {
        return state;
      })
  }
});

export const { addUser, addUsers } = usersSlice.actions;

export const loadUser = createAsyncThunk(
  'users/load',
  async (username, thunkApi) => {
    const { users } = thunkApi.getState();
    const cachedUser = users[username];

    if (cachedUser) {
      console.log('was cached');
      return cachedUser;
    }

    try {
      console.log('was not cached');
      return await usersService.getUser(username);
    } catch (error) {
      const { message, status } = handleAxiosError(error);
      return thunkApi.rejectWithValue({ message, status });
    }
  },
);

const handleAxiosError = (error) => {
  const { request, response } = error;

  if (response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { message } = response.data;
    const status = response.status;

    return { message, status };

  } else if (request) {
    // The request was made but no response was received
    return { message: 'server time out', status: 503 };

  } else {
    // Something happened in setting up the request that triggered an Error
    return { message: 'opps! something went wrong while setting up request' };
  }
}

export default usersSlice.reducer;