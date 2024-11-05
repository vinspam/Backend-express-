import { shortUserSchemaWithoutPassword } from '../../user/swagger/user.schema';
import * as AuthConstant from '../auth.constant';

const deviceId = {
  name: 'deviceId',
  in: 'header',
  default: '123',
  required: true,
};

const platform = {
  name: 'platform',
  in: 'header',
  schema: {
    type: 'string',
    enum: Object.keys(AuthConstant.PLATFORM),
  },
  required: true,
  default: AuthConstant.PLATFORM.WEB,
};

const authResponse = {
  type: 'object',
  properties: {
    accessToken: { type: 'string', required: true },
    refreshToken: { type: 'string', required: true },
    expiresIn: { type: 'number' },
  },
};

const signUpResponse = {
  type: 'object',
  properties: {
    auth: authResponse,
    user: shortUserSchemaWithoutPassword,
  },
};

const signInResponse = {
  type: 'object',
  properties: {
    auth: authResponse,
    user: shortUserSchemaWithoutPassword,
    quizPassed: { type: 'boolean' },
    joinedPlan: { type: 'boolean' },
  },
};

const signInTempResponse = {
  type: 'object',
  properties: {
    auth: authResponse,
    user: shortUserSchemaWithoutPassword,
  },
};

export const authSchema = {
  authResponse,
  signUpResponse,
  signInResponse,
  signInTempResponse,
};

export const deviceParameters = {
  deviceId,
  platform,
};
