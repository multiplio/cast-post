const logger = require('./logger')

// app requires
const users = require('./user')

const post = require('./post')

const app = require('express')()
const session = require('express-session')

app.use(require('helmet')())

app.use(require('body-parser').urlencoded(
  { extended: true }
))

// setup session store
require('./sessstore')(session)
  .then(store => {
    // use the store
    app.use(session(
      {
        secret: process.env.COOKIE_SECRET,
        store: store,
        resave: true,
        saveUninitialized: true,
        cookie: {
          // secure: true,
          maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        },
      }
    ))

    // setup users database
    users()
      .then(User => {
        // setup paths
        app.post('/', function (req, res) {
          if (req === null || req.query === null) {
            req.status(400).send('ERROR : provide required parameters')
            return
          }

          const desc = req.query.desc || ''
          const text = req.query.text || ''
          const fontSize = req.query.fontSize || '12'
          const spacing = req.query.spacing || '1.5'

          logger.debug(`?desc=${desc}&text=${text}&fontSize=${fontSize}&spacing=${spacing}`)

          post(desc, text, fontSize, spacing)
            .then(() => logger.debug('post - success'))
            .then(() => {
              res
                .status(200)
                .send('ok')
            })
            .catch((err) => {
              logger.error(`post - fail : ${err}`)
              res
                .status(503)
                .set({
                  'Retry-After': '2', // seconds
                })
                .send('retry')
            })
        })

        // start server
        app.listen(process.env.PORT)
        logger.info(`listening at localhost:${process.env.PORT}`)
      })
  })

