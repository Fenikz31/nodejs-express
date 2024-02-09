import { Router } from 'express';

import healthz from './healthz';
import info from './info';

interface CoreRoutes {
  [ key: string ]: () => Router;
}
const coreRoutes: CoreRoutes = {
  healthz,
  info,
};

export default coreRoutes;
