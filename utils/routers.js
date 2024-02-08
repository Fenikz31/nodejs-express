import express from 'express';
import fs from 'fs';

const __dirname = new URL('.', import.meta.url).pathname;
const default_controllers = await import( '../src/controllers/core/index.js' );

function createRouter({
  api = null,
  routes = null
} = {}) {
  const router = express.Router()

  router.use( `/${ api }`, routes )

  return routes;
}

export default function CreateRouters ({
  logger = null,
  app = null
} = {}) {
  const log = logger({ module: 'ROUTES'});
  const controllers = default_controllers.default
  const core = Object.keys( default_controllers.default );
  core.forEach(( route ) => {
    log.notice( `Configuring /${ route }` );
    app.get( `/${ route }`, controllers[ route ]() )
  });

  try {
    const Entrypoints = fs.readdirSync( __dirname + '../src/routes' )
      .filter(( item ) => {
        return fs.lstatSync( `${ __dirname}../src/routes/${ item }` ).isDirectory()
      })
      .map(( folder ) => {
        return {
          [ folder ]: fs.readdirSync( `${ __dirname}../src/routes/${ folder }` )
        }
      })
      .reduce(( a, b ) => ({ ...a, ...b }), {});

    const apis = Object.keys( Entrypoints )

    if ( apis.length === 0 ) {
      log.notice( 'No API found.' );
      return log.close();
    }

    const Routes = apis.map( async( api ) => {
      const api_path = `${ __dirname}../src/routes/${ api }/index.js`;
      try {
        const module = await import( api_path )
        const routes = module.default

        if ( routes === null )
          return;

        log.notice( `Configuring /api/${ api }` );
        const Routes = createRouter({ api, routes: routes() });
        return Routes;
      } catch ( error ) {
        log.error( error.message )
        log.close();
      }
    });

    return Routes;
  } catch ( error ) {
    log.error( error.message )
    log.close();
  }
}
