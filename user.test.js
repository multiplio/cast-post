/* eslint-disable */

jest.mock('./logger')

process.env.DATABASE_USER = 'user'
process.env.DATABASE_PASSWORD = 'password'
process.env.DATABASE_PROTOCOL = 'mongodb'
process.env.DATABASE_ADDRESS = 'address'
process.env.DATABASE_NAME = 'name'

const uri = `${process.env.DATABASE_PROTOCOL}://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_ADDRESS}/${process.env.DATABASE_NAME}`

describe('sets up correctly', () => {
  jest.mock('mongoose', () => {
    return {
      Schema: function (o) { return { statics: jest.fn(), } },
      model: function (n, s) { return n },
    }
  })
  const m = require('./user')

  test('creates a correct uri', done => {
    m((u, n) => new Promise((resolve, reject) => {
      expect(u).toBe(uri)
      done()
      const connection = {
        model: function (collectionName) { }
      }
      resolve(connection)
    }))
  })

  test('connects to the correct collection', done => {
    m((u, n) => new Promise((resolve, reject) => {
      const connection = {
        model: function (modelName) {
          expect(modelName).toBe('User')
          done()
        }
      }
      resolve(connection)
    }))
  })

  test('exits if no database connection', done => {
    jest
      .spyOn(process, 'exit')
      .mockImplementation((exitCode) => {
        expect(exitCode).toBe(0)
        done()
      })

    m((u, n) => Promise.reject('database error'))
  })
})

