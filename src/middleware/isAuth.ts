import expressJwt from 'express-jwt';
import { Request } from 'express';

import { TOKEN_SECRET } from '../config';

const publicPaths = [
  '/favicon.ico',
  { url: /\/api\/v1\/docs.*/ },
  { url: /\/api\/v[0-9]{1}\/version/ },
  { url: /\/api\/v[0-9]{1}\/health/ },
  { url: '/api/v1/auth/sign-up' },
  { url: '/api/v1/auth/sign-in' },
  { url: '/api/v1/auth/sign-in/temporary' },
  { url: '/api/v1/auth/sign-in/update-temp-token' },
  { url: '/api/v1/auth/sign-in/admin' },
  { url: '/api/v1/auth/check-code' },
  { url: '/api/v1/auth/update-token' },
  { url: '/api/v1/support' },
  { url: /\/api\/v1\/forgot-password.*/ },
  { url: '/api/v1/watch/code' },
  { url: '/api/v1/watch/heart-rate' },
  { url: '/api/v1/watch/add-calorie' },
  { url: '/api/v1/watch/unsubscribe' },
  { url: '/api/v1/watch/owner' },
  // { url: '/api/v1/test/', methods: ['GET'] },
];

export default expressJwt({
  secret: TOKEN_SECRET,
  algorithms: ['HS256'],
  userProperty: 'token',
  getToken: (req: Request) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
  },
}).unless({
  path: publicPaths,
});
