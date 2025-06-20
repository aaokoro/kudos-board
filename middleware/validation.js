const validateBoardRequest = (req, res, next) => {
  const { title, category, image } = req.body;

  const errors = [];

  if (!title) {
    errors.push('Title is required');
  }

  if (!category) {
    errors.push('Category is required');
  }

  if (!image) {
    errors.push('Image is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateCardRequest = (req, res, next) => {
  const { title, image } = req.body;

  const errors = [];

  if (!title) {
    errors.push('Title is required');
  }

  if (!image) {
    errors.push('Image is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateBoardRequest,
  validateCardRequest
};
