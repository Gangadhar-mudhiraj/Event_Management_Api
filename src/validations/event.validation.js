import Joi from 'joi';

 const eventSchema = Joi.object({
  title: Joi.string().max(100).required(),
  location: Joi.string().max(100).required(),
  dateTime: Joi.date().iso().required()  
});

export default eventSchema
