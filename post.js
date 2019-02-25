const logger = require('./logger')
const user = require('./user')
const fetch = require('node-fetch')
const mongoose = require('mongoose')

const ipfs = require('ipfs-http-client')(process.env.IPFS_ADDRESS, process.env.IPFS_PORT, { protocol: process.env.IPFS_PROTOCOL })

module.exports = (userID, post) => new Promise(function (resolve, reject) {
  if (!mongoose.Types.ObjectId.isValid(`${userID}`)) {
    reject(new Error(`invalid userID : ${userID}`))
  }
  const userOID = new mongoose.Types.ObjectId(`${userID}`)

  const postString = JSON.stringify(post)
  const buf = Buffer.from(postString, 'utf8')

  ipfs.block.put(buf, (err, block) => {
    if (err) {
      reject(err)
    }

    // block has been stored
    const key = block.cid.toBaseEncodedString()
    logger.debug(`${key} : ${block.data.toString()}`)

    const post = {
      hash: key,
      publishers: {
        service: 'twitter',
      },
      date: Date.now(),
    }

    // get user db model
    user()
    // add post to user
      .then(User => {
        User.update(
          { '_id': userOID },
          { '$push': { 'posts': post } }
        )
      })
    // route to publishers
      .then(() => fetch(`http://${process.env.PUBLISHER_ADDRESS}/twitter/${userID}/${key}`))
    // return
      .then(() => resolve(key))
    // errors
      .catch(err => {
        logger.error(err)
        process.exit(0)
      })
  })
})

