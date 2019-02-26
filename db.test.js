/* eslint-disable */

jest.mock('./logger')

process.env.DATABASE_USER = 'user'
process.env.DATABASE_PASSWORD = 'password'
process.env.DATABASE_ADDRESS = 'address'
process.env.DATABASE_NAME = 'name'

const uri = `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_ADDRESS}/${process.env.DATABASE_NAME}`

beforeEach(() => {
  jest.resetModules()
})

test('creates connection with right uri', done => {
  jest.setMock('mongoose', {
    createConnection: function (u, os) {
      expect(u).toBe(uri)
      done()

      return {
        on: jest.fn(),
        once: jest.fn(),
        close: jest.fn(),
      }
    },
  })
  require('./db')(uri, process.env.DATABASE_NAME)
})

test('resolves on connection open', () => {
  jest.setMock('mongoose', {
    createConnection: function (u, os) {
      return {
        id: 'connection',
        on: jest.fn(),
        once: function (event, cb) {
          if (event === 'open')
            cb()
        },
        close: jest.fn(),
      }
    },
  })

  expect.assertions(1)
  require('./db')(uri, process.env.DATABASE_NAME)
    .then(conn => {
      expect(conn.id).toBe('connection')
    })
})

test('retries on connection error', () => {
  const createConnection = function (u, os) {
    return {
      on: function (event, cb) {
        expect(event).toBe('error')
        cb('no database connection')
      },
      once: jest.fn(),
      close: jest.fn(),
    }
  }

  jest.setMock('mongoose', { createConnection })
  require('./db')(uri, process.env.DATABASE_NAME)
})

test('closes connection on SIGINT', done => {
  const mockClose = jest.fn()
  const createConnection = function (u, os) {
    return {
      on: jest.fn(),
      once: jest.fn(),
      close: mockClose,
    }
  }
  jest
    .setMock('mongoose', { createConnection })

  const exit = jest.spyOn(process, 'exit').mockImplementation(c => c)

  jest
    .spyOn(process, 'on')
    .mockImplementation((signal, cb) => {
      expect(signal).toBe('SIGINT')
      mockClose.mockImplementation((cb2) => {
        jest.spyOn(process, 'exit').mockImplementation((code) => {
          expect(code).toBe(0)
          done()
        })
        cb2()
      })
      cb()
    })

  require('./db')(uri, process.env.DATABASE_NAME)
})

