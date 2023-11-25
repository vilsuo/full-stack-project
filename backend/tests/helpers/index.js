const cookieKey = 'connect.sid';

const cookieHeader = cookie => {
  return { 'Cookie': `${cookieKey}=${cookie}` };
};

const get_SetCookie = response => {
  const cookie = response
    .get('set-cookie')
    .find(value => value.startsWith(cookieKey));
  
  if (cookie) {
    return cookie.split(';')[0].substring(cookieKey.length + 1);
  }

  return null;
};

module.exports = {
  cookieKey,
  cookieHeader,
  get_SetCookie,
};