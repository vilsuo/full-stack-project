import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/auth';
import relationsService from '../services/relations';

/*
TODO
- create selectors

- on remove & on add modify relations saved in local storage
*/

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  relations: JSON.parse(localStorage.getItem('relations')) || [],
};

const authSlice = createSlice({
  name: 'auth',
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

      .addCase(addRelation.fulfilled, (state, action) => {
        const relation = action.payload;
        const relations = [ ...state.relations, relation ];

        localStorage.setItem('relations', JSON.stringify(relations));
        
        return { ...state, relations };
      })
      .addCase(addRelation.rejected, (state, action) => {
        return state;
      })
      .addCase(removeRelation.fulfilled, (state, action) => {
        const relationId = action.payload;
        const relations = state.relations.filter(relation => relation.id !== relationId);
        
        localStorage.setItem('relations', JSON.stringify(relations));

        return { ...state, relations };
      })
      .addCase(removeRelation.rejected, (state, action) => {
        return state;
      })
  },
});

export const login = createAsyncThunk(
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
  async (credentials, thunkApi) => {
    try {
      const user = await authService.login(credentials);
      const relations = await relationsService.getRelationsBySource(user.username);

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

export const removeRelation = createAsyncThunk(
  'auth/removeRelation',
  async (relationId, thunkApi) => {
    try {
      const { username } = thunkApi.getState().auth.user;
      await relationsService.removeRelation(username, relationId);

      return relationId;

    } catch (error) {
      return thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export default authSlice.reducer;