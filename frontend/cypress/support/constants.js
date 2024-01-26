
const FRONTEND_BASE_URL = '/#';

export const URLS = {
  HOME_URL: `${FRONTEND_BASE_URL}/`,
  LOGIN_URL: `${FRONTEND_BASE_URL}/login`,
  REGISTER_URL: `${FRONTEND_BASE_URL}/register`,
  SEARCH_URL : `${FRONTEND_BASE_URL}/search`,

  getUserUrl : function (username) { 
    return `${FRONTEND_BASE_URL}/users/${username}`; 
  },
};

export const COOKIE_KEY = 'connect.sid';