/* eslint-disable */

process.env.DATABASE_USER = 'user'
process.env.DATABASE_PASSWORD = 'password'
process.env.DATABASE_PROTOCOL = 'mongodb'
process.env.DATABASE_ADDRESS = 'address'
process.env.DATABASE_NAME = 'name'

const uri = `${process.env.DATABASE_PROTOCOL}://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_ADDRESS}/${process.env.DATABASE_NAME}`

describe('session store', () => {
  jest.mock('./logger')

  jest.useFakeTimers()

  const mockStore = {
    on: jest.fn(),
  }
  const storeConstructor = jest.fn(() => mockStore)
  jest.setMock('connect-mongodb-session', () => storeConstructor )

  const m = require('./sessstore')

  test('creates a correct uri', () => {
    m({})
    expect(storeConstructor)
      .toBeCalledWith({ uri: uri, collection: 'sessions' })
  })

  test('resolves with store on connected', async () => {
    mockStore.on.mockImplementation((event, cb) => {
      if (event === 'connected')
        cb()
    })
    await expect(m({})).resolves.toBe(mockStore)
  })

  test('retries after 2000ms for store error', done => {
    mockStore.on.mockImplementation((event, cb) => {
      if (event === 'error')
        cb()
    })

    setTimeout.mockImplementation((fn, time) => {
      expect(time).toEqual(2000)
      done()
    })

    m({})
  })
})

describe('adds uri options correctly', () => {
  jest.resetModules()

  jest.mock('./logger')

  const storeConstructor = jest.fn(() => {
    return { on: jest.fn() }
  })
  jest.setMock('connect-mongodb-session', () => storeConstructor )

  process.env.DATABASE_OPTIONS = 'options'

  const m = require('./sessstore')

  test('creates a correct uri', () => {
    m({})
    expect(storeConstructor)
      .toBeCalledWith({ uri: uri + `?${process.env.DATABASE_OPTIONS}`, collection: 'sessions' })
  })
})

