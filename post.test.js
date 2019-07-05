/* eslint-disable */

jest.mock('./logger')

process.env.IPFS_ADDRESS = 'address'
process.env.IPFS_PORT = 'port'
process.env.IPFS_PROTOCOL = 'protocol'

describe('post', () => {
  const ObjectId = jest.fn()
  ObjectId.isValid = jest.fn().mockImplementation(() => true)
  jest.setMock('mongoose', {
    Types: {
      ObjectId,
    },
  })

  const mockFetch = jest.fn().mockImplementation(() => Promise.resolve('sent'))
  jest.setMock('node-fetch', mockFetch)

  const blockKey = 'block-key'
  const mockPut = jest.fn().mockImplementation(buffer => {
    return new Promise((resolve, reject) => {
      resolve({
        cid: {
          toBaseEncodedString: jest.fn(() => blockKey),
        },
        data: {
          toString: jest.fn(() => "block-data"),
        },
      })
    })
  })
  jest.setMock('ipfs-http-client', (address, port, { protocol }) => {
    return {
      block: {
        put: mockPut,
      },
    }
  })

  const mockUser = {
    updateOne: jest.fn().mockImplementation((selector, operation, cb) => {
      cb(null, selector)
    }),
  }

  const m = require('./post')({ User: mockUser })

  test('rejects invalid userID', async () => {
    ObjectId.isValid.mockImplementationOnce(() => false)
    const id = 'invalid id'
    await expect(m(id, {})).rejects.toThrow(`invalid userID : ${id}`)
  })
  test('rejects on ipfs error', async () => {
    mockPut.mockImplementationOnce((buffer, cb) => cb(new Error(), {}))
    await expect(m('', {})).rejects.toThrow()
  })

  test('resolves if okay', async () => {
    await expect(m('', {})).resolves.toBe()
  })

  test('rejects on user update failure', async () => {
    const error = 'user update error'
    mockUser.updateOne.mockImplementationOnce((selector, operation, cb) => {
      cb(Error(error), {})
    })
    await expect(m('', {})).rejects.toThrow(error)
  })
})

