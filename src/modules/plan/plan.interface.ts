export const getBodyWithFile = (req) => {
  if (req.file) req.body.thumbnailName = req.file.filename;
  return req.body;
};
