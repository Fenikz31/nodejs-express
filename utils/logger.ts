import Winston, { createLogger, format, Logger, transport } from 'winston';
import shortid from 'shortid';
import util from 'util';

const { LOG_LEVEL, LOG_PATH, NODE_ENV, npm_package_name } = process.env;
const level = LOG_LEVEL || 'debug';
const logPath = LOG_PATH || '/var/log';

interface LoggerOptions {
  id?: string;
  module?: string | null;
}

interface Colors {
  [ key: string ]: string;
}


export interface CustomLogger extends Logger {
  create?: () => Logger;
  init?: () => string;
}

function CreateLogger({ id = shortid.generate(), module = null }: LoggerOptions = {}): CustomLogger {
  const colors: Colors = {
    alert: 'orange',
    crit: 'red',
    debug: 'white',
    emerg: 'orange',
    error: 'red',
    http: 'magenta',
    info: 'green',
    notice: 'cyan',
    warning: 'yellow',
  };

  Winston.addColors(colors);

  const customFormat = format.printf(( info ) => {
    const { timestamp, level, message, service, args } = info;
    return `${ timestamp } - ${ id }  -  [ ${ level } ] - ( ${ service } ) ${ message } ${ args ? args : '' }`;
  });

  const transports: transport[] = [];

  if ( NODE_ENV === 'production' ) {
    transports.push(
      new Winston.transports.File({ filename: `${ logPath }/error.log`, level: 'error' }),
      new Winston.transports.File({ filename: `${ logPath }/combined.log` })
    );
  }

  if ( NODE_ENV !== 'production' ) {
    transports.push(
      new Winston.transports.Console({
        format: format.combine(
          format.timestamp(),
          format.prettyPrint(),
          format.json(),
          format(( info ) => {
            info.level = info.level.toUpperCase();
            if ( info[ Symbol.for( 'splat' )]) {
              const Arguments = info[ Symbol.for( 'splat' )];
              info.args = util.formatWithOptions({ colors: true, depth: null, sorted: true }, ...Arguments );
            }

            return info;
          })(),
          format.colorize(),
          customFormat
        ),
        handleExceptions: true,
        handleRejections: true,
        level,
      }) as transport
    );
  }

  const logger: CustomLogger = createLogger({
    defaultMeta: { id, service: module || npm_package_name },
    exitOnError: false,
    level,
    levels: {
      ...Winston.config.syslog.levels,
      http: 5,
    },
    transports,
  });

  logger.create = () => CreateLogger();
  logger.init = () => shortid.generate();

  return logger;
}

export default CreateLogger;
