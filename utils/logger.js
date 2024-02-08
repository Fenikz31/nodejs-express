import Winston  from 'winston';
import shortid from 'shortid';
import util from 'util';


const { createLogger, format } = Winston;
const { LOG_LEVEL, LOG_PATH, NODE_ENV, npm_package_name } = process.env;
const level = LOG_LEVEL || 'debug';
const logPath = LOG_PATH || '/var/log';

export default function CreateLogger ({
  id = shortid.generate(),
  module = null
} = {}) {
  const colors = {
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

  Winston.addColors( colors );

  const customFormat = format.printf(( info ) => {
    const { timestamp, level, message, service, args } = info
    return `${ timestamp } - ${ id }  -  [ ${ level } ] - ( ${ service } ) ${ message } ${ args ? args : '' }`;
  });

  const transports = []

  if ( NODE_ENV === 'production' ) {
    transports.push(
      new Winston.transports.File({ filename: `${ logPath }/error.log`, level: 'error', timestamp: true }),
      new Winston.transports.File({ filename: `${ logPath }/combined.log`, timestamp: true })
    )
  }

  if ( NODE_ENV !== 'production' ) {
    transports.push(
      new Winston.transports.Console({
        // close: () => CreateLogger({ id, module }),
        format: format.combine(
          format.timestamp(),
          format.prettyPrint(),
          format.json(),
          format(( info ) => {
            info.level = info.level.toUpperCase()
            if ( info[ Symbol.for( 'splat' )]) {
              const Arguments = info[ Symbol.for( 'splat' )]
              info.args = util.formatWithOptions({ colors: true, depth: null, sorted: true }, ...Arguments)
            }

            return info;
          })(),
          format.colorize(),
          customFormat
        ),
        handleExceptions: true,
        handleRejections: true,
        level
      })
    )
  }

  var logger = createLogger({
    defaultMeta: { id, service: module || npm_package_name },
    exitOnError: false, // do not exit on handled exceptions
    // handleExceptions: true,
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
