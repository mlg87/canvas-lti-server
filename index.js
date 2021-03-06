const app = require('express')()
const https = require('https')
const fs = require('fs')
const request = require('axios')
const bodyParser = require('body-parser')
const logger = require('morgan')
const oauthSignature = require('oauth-signature')
// const xFrameOptions = require('x-frame-options')
const port = process.env.PORT || 3001

app.use(bodyParser.json({ type: 'application/json' }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.text())

app.use(logger('combined'))

// app.use(xFrameOptions())

// TODO find a library to do this for me
let nonces = []
const checkOAuthNonce = (req, res, next) => {
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

// NOTE this needs to be fixed for any production app, desperately need to find a library for the OAuth
// else if (Date.now() - req.body.oauth_timestamp > 100000) {
//     return res
//       .status(500)
//       .send(
//         `Sorry, we think your timestamp is too old, but the stupid fucking LTI course thinks that a lot of timestamps from Jan 18, 1970 are valid, so you be the judge. Here is your timestamp in date format: ${new Date(
//           Number(req.body.oauth_timestamp)
//         )}`
//       )
//   }
const checkOAuthTimestamp = (req, res, next) => {
  if (!req.body.oauth_timestamp || req.body.oauth_timestamp === '') {
    return res.status(500).send('Sorry, no oauth_timestamp on your req')
  } else {
    next()
  }
}

const checkOAuthSignature = (req, res, next) => {
  if (!req.body.oauth_signature) {
    return res.status(500).send('Sorry, no oauth_signature on your req')
  } else {
    console.log('OAUTH_SIGNATURE', req.body.oauth_signature)
    next()
  }
}

app.get('/', (req, res) => {
  console.log('we wanna get something', req)
  res.send('well hello, world')
})

app.post('*', checkOAuthNonce, checkOAuthTimestamp, (req, res) => {
  // console.log('somebody is posting', req)
  console.log('BODY', req.body)
  console.log('QUERY', req.query)
  console.log('PARAMS', req.params)
  console.log('HEADERS', req.headers)
  // oauth sig shit
  const {
    oauth_consumer_key,
    oauth_signature_method,
    oauth_nonce,
    oauth_timestamp,
    oauth_version,
    oauth_signature
  } = req.body
  const httpMethod = 'POST'
  // const url = 'https://learn-lti.herokuapp.com'
  const url = 'https://damp-everglades-54548.herokuapp.com/'
  const params = {
    oauth_consumer_key,
    // missing a value for oauth_token
    // apparently supposed to omit oauth_nonce
    oauth_timestamp,
    oauth_signature_method,
    oauth_version
  }
  // this value is given in the lti course
  const consumerSecret = '435e733b44385d728e43b30d778ec00d'
  const encodedSignature = oauthSignature.generate(httpMethod, url, params, consumerSecret)
  const signature = oauthSignature.generate(httpMethod, url, params, consumerSecret, null, {
    encodeSignature: false
  })
  // all of the LTI bullshit is going to come through the body on posts when the url is loaded within an iframe
  const { body } = req
  res
    .status(200)
    .json({ signature_sent_from_client: oauth_signature, encodedSignature, signature, body })
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
