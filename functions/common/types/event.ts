import { StageEnvironment } from './environment';

export type Event<T> = {
  body: T,
  environment: StageEnvironment
};
