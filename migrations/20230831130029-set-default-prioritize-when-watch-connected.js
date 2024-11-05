module.exports = {
  async up(db, client) {
    await db.collection('workouts').updateMany({}, {$set: {prioritizeWhenWatchConnected: false}});
  },

  async down(db, client) {
    await db.collection('workouts').updateMany({}, {$unset: {prioritizeWhenWatchConnected: 1}});

  }
};
