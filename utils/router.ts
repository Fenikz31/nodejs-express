import express, { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

import CreateLogger from './logger';

import coreControllers from '../src/controllers/core/index';
import coreRoutes from '../src/routes/core/index';

interface CreateRouterOptions {
  api: string;
  routes: () => Router;
}

interface CreateRouterOptions {
  api: string;
  routes: () => Router;
}

function createRouter({ api, routes }: CreateRouterOptions): Router {
  const router = express.Router();
  router.use( `/api/${ api }`, routes());
  return router;
}

export default async function CreateRouters(): Promise< Router[]> {
  const log = CreateLogger({ module: 'ROUTES' });
  const controllers = coreControllers;
  const core = Object.keys( controllers );

  const routes: Router[] = []

  core.forEach(( route ) => {
    log.notice( `Configuring /${ route }` );
    const router = express.Router();
    router.use( `/${ route }`, coreRoutes[ route ]());
    routes.push( router )
  });

  try {
    const routesPath = path.join( __dirname, '../src/routes' );
    const entrypoints = await fs.readdir( routesPath );
    const apis = entrypoints.filter( async ( item ) => {
      const stats = await fs.lstat( path.join( routesPath, item ));
      return stats.isDirectory();
    });

    if ( apis.length === 0 ) {
      log.notice( 'No API found.' );
      log.close();
      return routes;
    }

    await Promise.all(
      apis.map( async ( api ) => {
        const apiPath = path.join( routesPath, api, 'index' );
        try {
          const module = await import( apiPath );
          const moduleRoutes = module.default;

          if ( api !== 'core' && moduleRoutes !== null ) {
            const apiRouter = createRouter({ api, routes: moduleRoutes });
            log.notice( `Configuring /api/${ api }` );
            routes.push( apiRouter );
          }
        } catch ( error: any ) {
          log.error( error.message );
          log.error( error.stack );
        }
      })
    );

    log.close();
    return routes;
  } catch ( error: any ) {
    log.error( error.message );
    log.close();
    return routes;
  }
}
