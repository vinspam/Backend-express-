import { UpdateProgressCron, VideoCron } from './crons';

// Crons

// Example
// const videoCron = new VideoCron('*/5 * * * *', {
//   scheduled: false,
//   timezone: "America/Sao_Paulo"
// });
// videoCron.startCron();

// Simple example
// new VideoCron('*/5 * * * *', { scheduled: true });

new VideoCron('*/10 * * * *', { scheduled: true });
// new UpdateProgressCron('0 */4 * * *', { scheduled: true });
