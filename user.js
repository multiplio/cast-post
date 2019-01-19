const logger = require('./logger.js')
const mongoose = require('mongoose')
const database = require('./db.js')

const url = `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_ADDRESS}/${process.env.DATABASE_NAME}`

module.exports = () => new Promise(function (resolve, reject) {
  // schema
  let userSchema = mongoose.Schema({
    displayName: String,

    twitterId: String,
    twitterAccessLevel: String,

    posts: [
      {
        hash: String,
        date: { type: Date, default: Date.now },
      },
    ],
  })

  mongoose.model('User', userSchema)
  logger.debug('user schema created')

  // get connection
  database(url, process.env.DATABASE_NAME)
    .then(conn => {
      logger.info(`got connection to ${process.env.DATABASE_NAME}`)
      resolve(conn.model('User'))
    })
    .catch(err => {
      logger.error(err)
      process.exit(0)
    })
})

