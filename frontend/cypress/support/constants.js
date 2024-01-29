
const FRONTEND_BASE_URL = '/#';

export const URLS = {
  HOME_URL: `${FRONTEND_BASE_URL}/`,
  SEARCH_URL : `${FRONTEND_BASE_URL}/search`,
  ABOUT_URL : `${FRONTEND_BASE_URL}/about`,

  LOGIN_URL: `${FRONTEND_BASE_URL}/login`,
  REGISTER_URL: `${FRONTEND_BASE_URL}/register`,

  getUserUrl : function (username) { 
    return `${FRONTEND_BASE_URL}/users/${username}`; 
  },

  FALLBACK_URL: `${FRONTEND_BASE_URL}/`,
};

export const CREDENTIALS = {
  USER: { name: 'ville', username: 'ville123', password: 'qwerty123' },
  OTHER_USER: { name: 'matti', username: 'matti123', password: 'fghjkl789' },
  DISABLED_USER: { name: 'sampsa', username: 'samp', password: 'qweyu456' },
};

export const COOKIE_KEY = 'connect.sid';