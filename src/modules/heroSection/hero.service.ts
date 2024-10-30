import { IUserDoc } from '../user/user.interfaces';
import { IHero, IHeroDoc } from './hero.interfaces';
import HeroSection from './hero.model';

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

export const getAllHeros = async (userId: IUserDoc['_id']): Promise<Array<IHeroDoc>> => {
  return HeroSection.find({ userId }).sort({ createdAt: -1 });
};
