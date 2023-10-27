import axios from 'axios';
import {
  createContext,
  useEffect, useState
} from 'react';

const baseUrl = '/api/auth';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );

  const login = async (credentials) => {
    const { data } = await axios.post(
      `${baseUrl}/login`,
      credentials,
      { withCredentials: true}
    );
    setCurrentUser(data);
  };

  const logout = async () => {
    const response = await axios.post(`${baseUrl}/logout`, {}, { withCredentials: true });
    console.log('response', response);
    setCurrentUser(null);
  };

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};