// Lightweight validators used in controllers - extend with Joi/express-validator if desired

const requireFields = (obj, fields = []) => {
  const missing = [];
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null || obj[f] === '') missing.push(f);
  }
  return missing;
};

module.exports = { requireFields };
