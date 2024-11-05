export const getBodyWithFile = (req) => {
    if (req.file) req.body.customThumbnail = req.file.filename;
    return req.body;
  };
  
export const getParamsResetPartAverageHR = (req) => {
    return {
      id: req.params.id,
      partIndex: req.params.partIndex,
    };
  }