export const createUser = (req) => req.body;

export const getId = (req) => {
  if (req.params.id === 'me') return req?.user?.userId || '000000000000000000000000';
  return req.params.id;
};

export const user = (req) => {
  if (req.body) {
    if (req.body.bodyPartList) req.body.bodyPartList = req.body.bodyPartList.split(',');
    if (req.body.bodyPartList === '') req.body.bodyPartList = [];
    if (req.body.workoutStyleList) req.body.workoutStyleList = req.body.workoutStyleList.split(',');
    if (req.body.workoutStyleList === '') req.body.workoutStyleList = [];
  }

  if (req.file) req.body.avatar = req.file.filename;
  return req.body;
};
