const logger = require('./logger')

const ipfs = require('ipfs-http-client')(process.env.IPFS_ADDRESS, process.env.IPFS_PORT, { protocol: process.env.IPFS_PROTOCOL })

module.exports = (description, content, fontSize = '12', spacing = '1.5') => new Promise(function (resolve, reject) {
  const postString = JSON.stringify({
    description,
    content,
    fontSize,
    spacing,
  })
  const buf = Buffer.from(postString, 'utf8')

  ipfs.block.put(buf, (err, block) => {
    if (err) {
      reject(err)
    }

    // Block has been stored
    const key = block.cid.toBaseEncodedString()

    logger.debug(`${key} : ${block.data.toString()}`)

    // // Try reading the block
    // ipfs.block.get(key, (err, block) => {
    //   if (err) {
    //     reject(err)
    //   }

    //   logger.debug(`${key} : ${block.data}`)
    // })

    resolve(key)
  })
})

