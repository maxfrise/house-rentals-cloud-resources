import { Stage } from './environment';

export type Event<T> = {
  body: T,
  environment: Stage
};
