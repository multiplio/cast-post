/* eslint-disable */

describe('usage', () => {
  let winston = null

  beforeEach(() => {
    jest.resetModules()

    jest.mock('winston')
    winston = require('winston')
    winston.createLogger = jest.fn(() => {
      return {
        info: jest.fn(),
        add: jest.fn()
      }
    })
    winston.format = {
      combine: jest.fn(),
      timestamp: jest.fn(),
      printf: jest.fn(),
    }
    winston.__transports = jest.fn()
    winston.transports = winston.__transports

    winston.transports.Console = jest.fn()

    winston.__transports.__File = jest.fn()
    winston.transports.File = winston.__transports.__File
  })

  test('sets correct log format - no alias', done => {
    delete process.env.PROGRAM_ALIAS

    winston.format.printf.mockImplementationOnce(print => {
      const msg = print({
        timestamp: 'time',
        level: 'level',
        message: 'message',
      })
      expect(msg).toBe(':time:level: message')
      done()
    })

    require('./logger')

    expect(winston.format.printf).toBeCalled()
  })
  test('sets correct log format', done => {
    process.env.PROGRAM_ALIAS = 'alias'

    winston.format.printf.mockImplementationOnce(print => {
      const msg = print({
        timestamp: 'time',
        level: 'level',
        message: 'message',
      })
      expect(msg).toBe('alias:time:level: message')
      done()
    })

    require('./logger')

    expect(winston.format.printf).toBeCalled()
  })

  test('sets logging level - debug', () => {
    process.env.LOG_LEVEL = 'debug'
    process.env.LOG_FILE = 'false'

    require('./logger')

    expect(winston.createLogger).toBeCalled()
    expect(winston.createLogger.mock.calls[0][0].level).toBe('debug')
  })
  test('sets logging level - info', () => {
    process.env.LOG_LEVEL = 'info'
    process.env.LOG_FILE = 'false'

    require('./logger')

    expect(winston.createLogger).toBeCalled()
    expect(winston.createLogger.mock.calls[0][0].level).toBe('info')
  })
  test('sets logging level - info', () => {
    process.env.LOG_LEVEL = 'info'
    process.env.LOG_FILE = 'true'

    require('./logger')

    expect(winston.__transports.__File).toBeCalledWith({ filename: 'error.log', level: 'error' })
    expect(winston.__transports.__File).toBeCalledWith({ filename: 'combined.log' })
  })
})

