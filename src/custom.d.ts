import { IUserDoc } from './modules/user/user.interfaces';

// types/express-session.d.ts

import 'express-session';

declare module 'express-serve-static-core' {
  export interface Request {
    user: IUserDoc;
  }
}

declare module 'express-session' {
  interface SessionData {
    oauthState?: string;
  }
}
