const app = require('express')()
const https = require('https')
const fs = require('fs')
const request = require('axios')
const bodyParser = require('body-parser')
const logger = require('morgan')
const xFrameOptions = require('x-frame-options')
const port = process.env.PORT || 3001

app.use(bodyParser.json({ type: 'application/json' }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.text())

app.use(logger('combined'))

app.use(xFrameOptions())

app.get('/', (req, res) => {
  console.log('we wanna get something', req)
  res.send('well hello, world')
})

app.post('*', (req, res) => {
  console.log('somebody is posting', req)
  res.send('so you wanna post?')
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
