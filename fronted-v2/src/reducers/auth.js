import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/auth';
import potraitService from '../services/potrait';
import relationsService from '../services/relations';

/*
TODO
- create selectors?

- on remove & on add modify relations saved in local storage
*/

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  potrait: JSON.parse(localStorage.getItem('potrait')) || null,
  relations: JSON.parse(localStorage.getItem('relations')) || [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.fulfilled, (state, action) => {
        const { user, potrait, relations } = action.payload;

        localStorage.setItem('user', JSON.stringify(user));
        if (potrait) localStorage.setItem('potrait', JSON.stringify(potrait));
        localStorage.setItem('relations', JSON.stringify(relations));

        return { ...state, user, potrait, relations };
      })
      .addCase(login.rejected, (state, action) => {
        return state;
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state, action) => {
        // remove all values from local storage
        localStorage.clear();

        // reset all values
        return { ...state, user: null, potrait: null, relations: [] };
      })
      .addCase(logout.rejected, (state, action) => {
        return state;
      })

      // POTRAIT
      .addCase(changePotrait.fulfilled, (state, action) => {
        const potrait = action.payload;

        localStorage.setItem('potrait', JSON.stringify(potrait));
        
        return { ...state, potrait };
      })
      .addCase(changePotrait.rejected, (state, action) => {
        return state;
      })
      .addCase(removePotrait.fulfilled, (state, action) => {
        localStorage.removeItem('potrait');

        return { ...state, potrait: null };
      })
      .addCase(removePotrait.rejected, (state, action) => {
        return state;
      })

      // RELATIONS
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
  async (credentials, thunkApi) => {
    try {
      const user = await authService.login(credentials);
      const { username } = user;

      let potrait;
      try {
        // see if user has a potrait
        potrait = await potraitService.getPotrait(username);

      } catch (error) {
        if (error.response && error.response.status === 404) {
          // user does not have a potrait
          potrait = null;
        } else {
          throw error;
        }
      }

      const relations = await relationsService.getRelationsBySource(username);

      return { user, potrait, relations };

    } catch (error) {
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

export const changePotrait = createAsyncThunk(
  'auth/changePotrait',
  async (formData, thunkApi) => {
    try {
      const { username } = thunkApi.getState().auth.user;
      return await potraitService.putPotrait(username, formData);

    } catch (error) {
      return thunkApi.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removePotrait = createAsyncThunk(
  'auth/deletePotrait',
  async (_, thunkApi) => {
    try {
      const { username } = thunkApi.getState().auth.user;
      return await potraitService.removePotrait(username);

    } catch (error) {
      return thunkApi.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addRelation = createAsyncThunk(
  'auth/addRelation',
  async ({ targetUserId, type }, thunkApi) => {
    try {
      const { username } = thunkApi.getState().auth.user;
      return await relationsService.addRelation(username, targetUserId, type);

    } catch (error) {
      return thunkApi.rejectWithValue(getErrorMessage(error));
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
      return thunkApi.rejectWithValue(getErrorMessage(error));
    }
  }
);

const getErrorMessage = (error) => {
  const { response, request } = error;
  
  if (response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx

    return response.data.message || 'something went wrong';

  } else if (request) {
    // The request was made but no response was received
    return 'server time out';

  } else {
    // Something happened in setting up the request that triggered an Error
    return 'something went wrong while setting up the request'
  }
};

export default authSlice.reducer;