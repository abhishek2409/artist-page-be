import { Session } from 'express-session';

export interface CustomSession extends Session {
  oauth_state?: string;
}
