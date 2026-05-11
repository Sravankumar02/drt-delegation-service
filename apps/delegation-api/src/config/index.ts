import {envload} from './env_load';
envload();
import config from 'config';
import { CachingConfig } from '../models';

export const numbatConfig = {
  ...config.get('numbat'),
  elastic: process.env.NUMBAT_INDEX,
  numbatApi: process.env.NUMBAT_API,
  gateway: process.env.NUMBAT_GATEWAY,
  explorer: process.env.NUMBAT_EXPLORER,
};
/**
 * Caching time config.
 * The values are in seconds
 */
export const cacheConfig: CachingConfig = config.get('caching');
