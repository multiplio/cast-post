const logger = require('./logger')

const fetch = require('node-fetch')
const mongoose = require('mongoose')

const ipfs = require('ipfs-http-client')(process.env.IPFS_ADDRESS, process.env.IPFS_PORT, { protocol: process.env.IPFS_PROTOCOL })

module.exports = ({ User }) => (userID, post) => new Promise(function (resolve, reject) {
  if (!mongoose.Types.ObjectId.isValid(`${userID}`)) {
    reject(Error(`invalid userID : ${userID}`))
  }
  const userOID = new mongoose.Types.ObjectId(`${userID}`)

  const postString = JSON.stringify(post)
  const buf = Buffer.from(postString, 'utf8')

  // add to ipfs
  const put = ipfs.block.put(buf)
    .then(block => {
      // block has been stored
      const key = block.cid.toBaseEncodedString()
      logger.debug(`${key} : ${block.data.toString()}`)

      return key
    })
    .then(key => new Promise(function (resolve, reject) {
      // add post to user
      const post = {
        hash: key,
        publishers: {
          service: 'twitter',
        },
        date: Date.now(),
      }
      User.updateOne(
        { '_id': userOID },
        { '$push': { 'posts': post } },
        function (err, raw) {
          if (err !== null) {
            reject(err)
          }
          resolve(raw)
        }
      )
    }))

  // wait for publish and insert before returning
  Promise.all([
    put,
    fetch(`http://${process.env.PUBLISHER_ADDRESS}/twitter/${userID}/${key}`),
  ])
    .then(() => resolve(key))
    .catch(err => reject(err))
})

