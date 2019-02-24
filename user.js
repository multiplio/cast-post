const logger = require('./logger.js')
const mongoose = require('mongoose')
const database = require('./db.js')

let uri = `${process.env.DATABASE_PROTOCOL}://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_ADDRESS}/${process.env.DATABASE_NAME}`
if (process.env.DATABASE_OPTIONS && process.env.DATABASE_OPTIONS !== '') {
  uri += `?${process.env.DATABASE_OPTIONS}`
}

let model = null

module.exports = () => new Promise(function (resolve, reject) {
  if (model !== null) {
    resolve(model)
  }

  // schema
  let userSchema = mongoose.Schema({
    displayName: String,

    posts: [
      {
        hash: String,
        publishers: [
          { service: String },
        ],
        date: { type: Date, default: Date.now },
      },
    ],
  })

  mongoose.model('User', userSchema)
  logger.debug('user schema created')

  // get connection
  database(uri, process.env.DATABASE_NAME)
    .then(conn => {
      logger.info(`got connection to ${process.env.DATABASE_NAME}`)
      model = conn.model('User')
      resolve(model)
    })
    .catch(err => {
      logger.error(err)
      process.exit(0)
    })
})

