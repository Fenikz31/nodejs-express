import 'dotenv/config';

import cors from 'cors';
import express, { Request, Response, NextFunction, Application } from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';

import app from './src/app';
import CreateLogger from './utils/logger';
import CreateRouters from './utils/router';

const { HOST, PORT } = process.env;
const host : string = HOST || 'localhost';
const port : number = PORT ? parseInt( PORT,10 )  : 3333;
const logger = CreateLogger();
const server = createServer( app );
const version = process.env.npm_package_version;

const morganMiddleware = morgan(
  morganJSONFormat(),
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write( message ) {
        const log = logger.create ? logger.create() : null;
        if ( log !== null ) {
          log.http( message );
          log.close();
        }
      }
    }
  }
);

function morganJSONFormat() {
  return JSON.stringify({
    method: ':method',
    url: ':url',
    remote_addr: ':remote-addr',
    remote_user: ':remote-user',
    user_agent: ':user-agent',
    'x-forwarded-for': ':req[x-forwarded-for]',
    status: ':status',
    content_length: ':res[content-length]',
    http_version: ':http-version',
    response_time: ':response-time ms',
    total_time: ':total-time ms',
    version
  })
};

app.use( cors());
app.use( helmet());
app.use( express.json());
app.use( morganMiddleware );

async function Start() {
  try {
    const routes = await CreateRouters();

    app.use( '/', routes );

    app.use( '*',( req: Request, res: Response, next: NextFunction ) => {
      return res.status( 404 ).json({
          success: false,
          message: `${ req.method } ${ req.baseUrl } not found.`,
          data: {
          }
      });
    });

    app.use(( err: Error, req: Request, res: Response, next: NextFunction ) => {
      const data = {
        error: {
          name: err.name,
          stack: err.stack
        }
      };

      logger.error( err.name );
      logger.error( err.message );
      logger.error( err.stack );
      return res.status( 500 ).json({
        success: false,
        message: err.message,
        data
      });
    });

    server.listen( port, host, () => {
      logger.notice( `Server listening on ${ host }:${ port }` );
      logger.close();
    });

  } catch ( error: any ) {
    logger.error( error.message );
    logger.close();
  }
};

Start();

process.on( 'SIGINT', () => {
  shutdown();
});

process.on( 'SIGTERM', () => {
  shutdown();
});

function shutdown() {
  const logger = CreateLogger();
  logger.notice( 'Received signal for shutdown. Closing server...' );
  server.close(() => {
    logger.notice( 'Server closed. Exiting process.' );
    logger.close();
    process.exit( 0 );
  });
}
