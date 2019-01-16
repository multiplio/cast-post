const logger = require('./logger')
const StoreIniter = require('connect-mongodb-session')

const uri = `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_ADDRESS}/${process.env.DATABASE_NAME}`

module.exports = function (session) {
  return new Promise(function (resolve, reject) {
    (function init () {
      const MongoDBStore = StoreIniter(session)

      let store = new MongoDBStore({
        uri: uri,
        collection: 'sessions',
      })

      store.on('connected', function () {
        // store.client; // The underlying MongoClient object from the MongoDB driver
        logger.info(`got connection to session store ${process.env.DATABASE_NAME}`)
        resolve(store)
      })

      store.on('error', function (err) {
        logger.error(`${err} : retrying for session store ${process.env.DATABASE_NAME}`)
        setTimeout(init, 2000)
      })
    })()
  })
}

