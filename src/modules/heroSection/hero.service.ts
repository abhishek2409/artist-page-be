import mongoose from 'mongoose';
import httpStatus from 'http-status';
import { IUserDoc } from '../user/user.interfaces';
import { IHero, IHeroDoc } from './hero.interfaces';
import HeroSection from './hero.model';
import { ApiError } from '../errors';

// eslint-disable-next-line import/prefer-default-export
export const createHero = async ({
  title,
  description,
  mediaURL,
  mediaType,
  mediaAlt,
  cta,
  userId,
}: IHero): Promise<IHeroDoc> => {
  const heroData = {
    title,
    description,
    mediaURL,
    mediaType,
    mediaAlt,
    cta,
    userId,
  };

  return HeroSection.create(heroData);
};

export const updateHero = async (heroId: mongoose.Types.ObjectId, data: IHero): Promise<IHeroDoc> => {
  const hero = await HeroSection.findByIdAndUpdate(heroId, data, { new: true });
  if (!hero) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Hero not found');
  }
  return hero;
};

export const getAllHeros = async (userId: IUserDoc['_id']): Promise<Array<IHeroDoc>> => {
  return HeroSection.find({ userId }).sort({ createdAt: -1 });
};

export const getOneHero = async (id: mongoose.Types.ObjectId, userId: IUserDoc['_id']): Promise<IHeroDoc | null> => {
  const hero = await HeroSection.findById(id).where({ userId });
  if (!hero) {
    throw new ApiError(httpStatus.NO_CONTENT, 'No Hero Found');
  }
  return hero;
};

export const deleteOneHero = async (id: mongoose.Types.ObjectId, userId: IUserDoc['_id']): Promise<Array<IHeroDoc>> => {
  const hero = await HeroSection.findByIdAndDelete(id);
  if (!hero) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Failed to delete hero');
  }
  return HeroSection.find({ userId }).sort({ createdAt: -1 });
};
