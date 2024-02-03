import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/auth';
import potraitService from '../services/potrait';
import relationsService from '../services/relations';
import { createErrorMessage } from '../util/error';

/*
TODO
- create selectors?

- split into three reducers?
*/

const initialState = {
  user: null,
  potrait: null,
  relations: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAll: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // AUTO-LOGIN
      .addCase(autoLogin.fulfilled, (state, action) => {
        const { user, potrait, relations } = action.payload;

        return { ...state, user, potrait, relations };
      })

      // LOGIN
      .addCase(login.fulfilled, (state, action) => {
        const { user, potrait, relations } = action.payload;

        return { ...state, user, potrait, relations };
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state, action) => {
        // reset all values
        return initialState;
      })

      // POTRAIT
      .addCase(changePotrait.fulfilled, (state, action) => {
        const potrait = action.payload;

        return { ...state, potrait };
      })
      .addCase(removePotrait.fulfilled, (state, action) => {
        return { ...state, potrait: null };
      })

      // RELATIONS
      .addCase(addRelation.fulfilled, (state, action) => {
        const relation = action.payload;
        const relations = [ ...state.relations, relation ];

        return { ...state, relations };
      })
      .addCase(removeRelation.fulfilled, (state, action) => {
        const relationId = action.payload;
        const relations = state.relations.filter(relation => relation.id !== relationId);
        
        return { ...state, relations };
      });
  },
});

export const { resetAll } = authSlice.actions;

const getUserDetails = async (user) => {
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

  return { potrait, relations };
};

export const autoLogin = createAsyncThunk(
  'auth/autoLogin',
  async (_, thunkApi) => {
    try {
      const user = await authService.autoLogin();
      const details = await getUserDetails(user);
      return { user, ...details };

    } catch (error) {
      return thunkApi.rejectWithValue(createErrorMessage(error));
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, thunkApi) => {
    try {
      const user = await authService.login(credentials);
      const details = await getUserDetails(user);
      return { user, ...details };

    } catch (error) {
      return thunkApi.rejectWithValue(createErrorMessage(error));
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkApi) => {
    try {
      return await authService.logout();

    } catch (error) {
      return thunkApi.rejectWithValue(createErrorMessage(error));
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
      return thunkApi.rejectWithValue(createErrorMessage(error));
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
      return thunkApi.rejectWithValue(createErrorMessage(error));
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
      return thunkApi.rejectWithValue(createErrorMessage(error));
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
      return thunkApi.rejectWithValue(createErrorMessage(error));
    }
  }
);

export default authSlice.reducer;