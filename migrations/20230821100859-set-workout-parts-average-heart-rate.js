module.exports = {
  async up(db, client) {
    await db.collection('workouts').updateMany({'video.parts': {$exists: true}}, {$set: { 'video.parts.$[].averageHR': 0, 'video.parts.$[].completedNum': 0, }});
  },

  async down(db, client) {
    await db.collection('workouts').updateMany({'video.parts': {$exists: true}}, {$unset: { 'video.parts.$[].averageHR': 0, 'video.parts.$[].completedNum': 0, }});
  }
};
