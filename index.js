const app = require('express')()
const https = require('https')
const fs = require('fs')
const request = require('axios')
const bodyParser = require('body-parser')
const logger = require('morgan')
// const xFrameOptions = require('x-frame-options')
const port = process.env.PORT || 3001

app.use(bodyParser.json({ type: 'application/json' }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.text())

app.use(logger('combined'))

// app.use(xFrameOptions())

// TODO find a library to do this for me
let nonces = []
const checkForNonce = (req, res, next) => {
  if (!req.body.oauth_nonce) {
    return res
      .status(500)
      .send('Sorry, there was no oauth_nonce in your request. Contact your sys admin')
  } else if (nonces.includes(req.body.oauth_nonce)) {
    return res
      .status(500)
      .send('Sorry, you sent an out of date oauth_nonce. Contact your sys admin')
  } else {
    nonces.push(req.body.oauth_nonce)
    next()
  }
}

const checkForTimestamp = (req, res, next) => {
  if (!req.body.oauth_timestamp || req.body.oauth_timestamp === '') {
    return res.status(500).send('Sorry, no oauth_timestamp on your req')
  } else if (Date.now() - req.body.oauth_timestamp > 100000) {
    return res
      .status(500)
      .send(
        `Sorry, we think your timestamp is too old, but the stupid fucking LTI course thinks that a lot of timestamps from Jan 18, 1970 are valid, so you be the judge. Here is your timestamp in date format: ${new Date(
          req.body.oauth_timestamp
        )}`
      )
  } else {
    next()
  }
}

app.get('/', (req, res) => {
  console.log('we wanna get something', req)
  res.send('well hello, world')
})

app.post('*', checkForNonce, checkForTimestamp, (req, res) => {
  console.log('somebody is posting', req)
  // all of the LTI bullshit is going to come through the body on posts when the url is loaded within an iframe
  const { body } = req
  res.status(200).json({ body })
})

app.listen(port, () => console.log(`listening on port ${port}`))

// const httpsOptions = {
//   key: fs.readFileSync('./key.pem'),
//   cert: fs.readFileSync('./cert.pem')
// }
// const server = https.createServer(httpsOptions, app).listen(port, () => {
//   console.log(`https server running on port ${port}`)
// })

// const requestInstance = request.create({
//   baseURL: 'https://canvas.instructure.com/api/v1/',
//   headers: {
//     Authorization: 'Bearer 7~pTo38tZV4ldpISFKJ95RFesmGvNyLm7MqQ33MmYB7qy2YpwydzXyV5IpJ06Cqi4K'
//   }
// })

// requestInstance
//   .get('courses')
//   .then(res => {
//     console.log('#########################################################')
//     console.log(`STATUS: ${res.status} | STATUS_TEXT: ${res.statusText}`)
//     console.log('DATA: ', res.data)
//     console.log('#########################################################')
//   })
//   .catch(error => {
//     console.error(error)
//   })
