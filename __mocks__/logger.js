const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format

const logFormat = printf(info => {
  return `${process.env.PROGRAM_ALIAS || ''}:${info.timestamp}:${info.level}: ${info.message}`
})

const logger = createLogger({
  level: 'silly',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.File({ filename: 'test.log' }),
  ],
})

module.exports = logger

