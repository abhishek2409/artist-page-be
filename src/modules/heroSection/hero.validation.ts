import Joi from 'joi';

// eslint-disable-next-line import/prefer-default-export
export const createHeroSectionValidation = {
  body: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    mediaAlt: Joi.string().optional(),
    media: Joi.any().required(),
    cta: Joi.object({
      title: Joi.string().required(),
      url: Joi.string().uri().required(),
    }).optional(),
  }),
};
