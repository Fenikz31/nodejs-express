import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import app from './src/app.js';
import CreateLogger from './utils/logger.js';
import CreateRouters from './utils/routers.js';

const { HOST, PORT } = process.env;
const host = HOST || 'localhost';
const port = PORT || 3333;
const logger = CreateLogger();
const version = process.env.npm_package_version;
let log = null
const morganMiddleware = morgan(
  morganJSONFormat(),
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write( message ) {
        log = logger.create()
        log.http( message );
        log.close();
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

Promise.all(
  CreateRouters({ app, logger: CreateLogger }))
    .then(( routes ) => {
      app.use( '/api', routes );
      Start();
    })
    .catch(( error ) => Start());

function Start() {
  app.use( '*',( req, res, next ) => {
    return res.status( 404 ).json({
        success: false,
        message: `${ req.method } ${ req.baseUrl } not found.`,
        data: {
        }
    });
  });

  app.use(( err, req, res, next ) => {
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

  app.listen( port, host, () => {
    logger.notice( `Server listening on ${ host }:${ port }` );
    logger.close();
  });
};
