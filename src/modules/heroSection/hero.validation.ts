/* eslint-disable import/prefer-default-export */
import Joi from 'joi';
import { objectId } from '../validate';

export const createHeroSectionValidation = {
  body: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    mediaAlt: Joi.string().optional(),
    media: Joi.any().required(),
    ctaTitle: Joi.string().optional(),
    ctaUrl: Joi.string().uri().optional(),
  }),
};

export const deleteHeroSectionValidation = {
  params: Joi.object().keys({
    heroId: Joi.string().custom(objectId).required(),
  }),
};

export const updateHeroSectionValidation = {
  params: Joi.object().keys({
    heroId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    mediaAlt: Joi.string().optional(),
    media: Joi.any().optional(),
    cta: Joi.object({
      title: Joi.string().optional(),
      url: Joi.string().uri().optional(),
    }).optional(),
  }),
};
