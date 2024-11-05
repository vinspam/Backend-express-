module.exports = {
  async up(db, client) {
    const res = await db.collection('workouts').find().toArray();
    const promises = res.map((doc) => db.collection('workouts').updateOne({_id: doc._id}, {$set: {bodyPart: [doc.bodyPart]}}));
    await Promise.all(promises)
  },

  async down(db, client) {
    const res = await db.collection('workouts').find().toArray();
    const promises = res.map((doc) => db.collection('workouts').updateOne({_id: doc._id}, {$set: {bodyPart: doc.bodyPart[0]}}));
    await Promise.all(promises)
  }
};
