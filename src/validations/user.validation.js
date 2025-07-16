export const userSchema = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().max(150).required()
});