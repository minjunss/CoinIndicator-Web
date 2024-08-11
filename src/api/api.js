export const BASE_URL = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  WEBSOCKET_BASE_URL: process.env.REACT_APP_WEBSOCKET_BASE_URL,
  DISCORD_INVITE_URL: process.env.REACT_APP_DISCORD_INVITE_URL,
};

export const ENDPOINTS = {
  WEBSOCKET_INDICATORS_SUBSCRIBE: `/topic/indicators`,
  WEBSOCKET_INDICATORS_PUBLISH: `/pub/indicators`,
  GET_INDICATORS_BY_MARKET: `${BASE_URL.API_BASE_URL}/indicator`,
  GET_POST_DELETE_FAVORITE: `${BASE_URL.API_BASE_URL}/user/favorites`,
  GET_FEAR_AND_GRID_IMG:
    "https://alternative.me/crypto/fear-and-greed-index.png",
  POST_LOGOUT: `${BASE_URL.API_BASE_URL}/auth/logout`,
  GET_USER_INFO: `${BASE_URL.API_BASE_URL}/user/info`,
};

export const OAUTH2 = {
  GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  GOOGLE_REDIRECT_URI: process.env.REACT_APP_GOOGLE_REDIRECT_URI,
};
