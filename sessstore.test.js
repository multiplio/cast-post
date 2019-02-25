/* eslint-disable */

jest.mock('./logger')

process.env.DATABASE_USER = 'user'
process.env.DATABASE_PASSWORD = 'password'
process.env.DATABASE_PROTOCOL = 'mongodb'
process.env.DATABASE_ADDRESS = 'address'
process.env.DATABASE_NAME = 'name'

const uri = `${process.env.DATABASE_PROTOCOL}://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_ADDRESS}/${process.env.DATABASE_NAME}`

describe('session store', () => {
  const storeConstructor = jest.fn(() => {
    return { on: jest.fn() }
  })
  jest.setMock('connect-mongodb-session', () => storeConstructor )
  const m = require('./sessstore')

  test('creates a correct uri', () => {
    m({})
    expect(storeConstructor)
      .toBeCalledWith({ uri: uri, collection: 'sessions' })
  })

})

// test('exits if no database connection', done => {
//   jest
//     .spyOn(process, 'exit')
//     .mockImplementation((exitCode) => {
//       expect(exitCode).toBe(0)
//       done()
//     })

//   m((u, n) => Promise.reject('database error'))
// })

