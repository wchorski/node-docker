const { MONGO_USER, MONGO_PASS, MONGO_IP, MONGO_PORT, SESSION_SECRET, REDIS_URL, REDIS_PORT } = require ('./config/config')
const express = require('express')
const app = express()
const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes')
const session = require('express-session')
const redis = require('redis')
let RedisStore = require('connect-redis')(session)
let redisClient = redis.createClient({
  host: REDIS_URL,
  port: REDIS_PORT
})

const mongoose = require('mongoose')
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`
const connectWithRetry = () => {
  mongoose
    .connect(mongoURL, {
      useNewURLParser: true,
      useUnifiedTopology: true,
      // useFindAndModify: false,
    })
    .then(  ()   => console.log("-- Mongoose Connected --"))
    .catch((err) => {
      console.error(err)
      setTimeout(connectWithRetry, 5000)
    })
}
connectWithRetry()

app.use(session({
  store: new RedisStore({client: redisClient}),
  secret: SESSION_SECRET, 
  cookie: {
    secure: false,
    resave: false,
    saveUninitialized: false,
    httpOnly: true,
    maxAge: 60000,
  },
}))

app.use(express.json())

app.set('json spaces', 2) //? prettyfiy json in browser
app.get('/', (req, res) => {
  res.json({title: 'hello', message: 'where u going?'})
})

// localhost:3000/api/v1/posts
app.use('/api/v1/posts', postRouter)
app.use('/api/v1/users', userRouter)

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`-- Listening on port ${port} --`))