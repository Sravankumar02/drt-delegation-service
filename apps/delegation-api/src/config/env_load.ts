import * as dotenv from 'dotenv';

import * as path from 'path';

const nodeEnv: string = process.env.NODE_ENV
  ? process.env.NODE_ENV.trim() : 'production';

export const envload = () => {
  if (!process.env.NODE_CONFIG_DIR) {
    process.env.NODE_CONFIG_DIR = path.join(process.cwd(), 'apps/delegation-api/src/config');
  }
  switch (nodeEnv) {
    case 'test':
      dotenv.config({ path: '.env.test' });
      break;
    default:
      dotenv.config({ path: '.env' });
      break;
  }
};
