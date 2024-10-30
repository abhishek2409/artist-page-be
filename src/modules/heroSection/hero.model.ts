import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import { IHeroDoc, IHeroModel } from './hero.interfaces';

const heroSchema = new mongoose.Schema<IHeroDoc, IHeroModel>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    mediaURL: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      required: true,
    },
    mediaAlt: {
      type: String,
      required: true,
    },
    cta: {
      type: Object,
      required: false,
      title: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      target: {
        type: String,
        required: true,
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
heroSchema.plugin(toJSON);

const HeroSection = mongoose.model<IHeroDoc, IHeroModel>('HeroSection', heroSchema);

export default HeroSection;
