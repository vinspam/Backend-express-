import 'dotenv/config';
import { FILE_FOLDER, PORT, ALLOW_HOSTS } from './config';

import express from 'express';
import cors from 'cors';
import path from 'path';

import RootRouter from './root.router';

import authorize from './middleware/authorize';
import { routeNotFound, errorHandler } from './middleware/errorHandler';
import setPaymentStatusClass from './middleware/setPaymentStatus';
import logger from './middleware/logger';

const app = express();

app.use(
  cors({
    origin: ALLOW_HOSTS,
    methods: 'OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/v1', logger, authorize, setPaymentStatusClass, new RootRouter().router);
app.use('/static/images/avatars', express.static(path.join(__dirname, '../../', FILE_FOLDER, 'avatars')));
app.use('/static/images/plans/', express.static(path.join(__dirname, '../../', FILE_FOLDER, 'plans')));
app.use(
  '/static/images/workoutThumbnail/',
  express.static(path.join(__dirname, '../../', FILE_FOLDER, 'workoutThumbnail'))
);
app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.use([routeNotFound, errorHandler]);

app.listen(PORT, () => console.info('Server listening on port ' + PORT));

// for testing cron normal in comment
// const cron = require('./cron');
