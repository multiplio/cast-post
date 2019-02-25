const logger = require('./logger')

// app requires
const database = require('./db.js')
const users = require('./user')(database)
const post = require('./post')

const bodyParser = require('body-parser')
const app = require('express')()
const session = require('express-session')

app.use(require('helmet')())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded(
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
    users
      .then(User => {
        // setup paths
        app.post('/', function (req, res) {
          // check if authenticated
          if (!req || !req.session || !req.session.passport) {
            res
              .status(401)
              .send('error : no session found')
            return
          }

          // get user
          const userID = req.session.passport.user

          // check if body present
          if (req === null || req.body === null) {
            res
              .status(400)
              .send('error : provide required parameters')
            return
          }

          // get values + defaults
          const desc = req.body.desc || ''
          const text = req.body.text || ''
          const fontSize = req.body.fontSize || 12
          const spacing = req.body.spacing || 1.5

          logger.debug(`desc='${desc}' text='${text}' fontSize='${fontSize}' spacing='${spacing}'`)

          // save to msgstore and route to publishers
          post(userID,
            {
              description: desc,
              content: text,
              fontSize,
              spacing,
            })
            .then((cid) => logger.info(`post - success : ${cid}`))
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

