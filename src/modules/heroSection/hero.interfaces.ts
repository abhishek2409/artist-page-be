import { Model, Document } from 'mongoose';
import { IUserDoc } from '../user/user.interfaces';

export type MediaType = 'image' | 'video';
export type HeroCTA = {
  title: string;
  url: string;
  target: string;
  type?: string;
  icon?: string;
};
export interface IHero {
  title: string;
  description: string;
  mediaURL: string;
  mediaType: MediaType;
  mediaAlt?: string;
  cta?: HeroCTA;
  userId: IUserDoc['_id'];
}

export interface IHeroDoc extends IHero, Document {}

export interface IHeroModel extends Model<IHeroDoc> {}
