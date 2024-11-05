module.exports = {
  async up(db, client) {
    await db.collection('progress').updateMany({}, {$set: { 'days.$[day].workout.ratedAt': new Date() }}, {arrayFilters: [{'day.workout.rate': {$gt: 0}}]});
    await db.collection('progress').updateMany({}, {$set: { 'days.$[day].altWorkout.ratedAt': new Date() }}, {arrayFilters: [{'day.altWorkout.rate': {$gt: 0}}]});
  },

  async down(db, client) {
    await db.collection('progress').updateMany({}, {$unset: { 'days.$[day].workout.ratedAt': new Date() }}, {arrayFilters: [{'day.workout.ratedAt': {$exists: true}}]});
    await db.collection('progress').updateMany({}, {$unset: { 'days.$[day].altWorkout.ratedAt': new Date() }}, {arrayFilters: [{'day.altWorkout.ratedAt': {$exists: true}}]});
  }
};