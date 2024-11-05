module.exports = {
  async up(db, client) {
    await db.collection('workouts').updateMany({}, {$set: { difficultyResetAt: new Date(0) }});
  },

  async down(db, client) {
    await db.collection('workouts').updateMany({}, {$unset: { difficultyResetAt: 1 }});
  }
};
