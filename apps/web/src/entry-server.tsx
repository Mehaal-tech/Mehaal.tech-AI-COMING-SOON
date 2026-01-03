import { createStartHandler, defaultStreamHandler } from '@solidjs/start/server';

export default createStartHandler(() => {
  return defaultStreamHandler();
});