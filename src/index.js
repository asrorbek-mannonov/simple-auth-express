const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const app = express()
app.use(cors())
app.use(express.json())

const users = [
  {
    id: 1,
    username: 'admin',
    fullname: 'John Doe',
    password: '123',
    status: true,
    rules: {
      posts: {
        show: true,
        create: true,
        update: true,
        delete: true
      },
      dashboard: {
        show: true
      }
    }
  },
  {
    id: 2,
    username: 'user',
    fullname: 'John Doe',
    password: '123',
    status: true,
    rules: {
      dashboard: {
        show: true
      }
    }
  }
]

function jwtMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).send('Unauthorized')

  const token = header && header.split(' ')[1]
  if (!token) return res.status(401).send('Unauthorized')

  jwt.verify(token, 'JWT_SECRET_KEY', (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.post('/api/auth/login', (req, res) => {
  const cred = req.body
  if (!cred) return res.status(400).send('Bad Request')
  const user = users.find(user => user.username === cred.username)
  if (!user) return res.status(401).send('Credentials not found')
  if (user.password !== cred.password) return res.status(401).send('Invalid password')

  const token = jwt.sign({ id: user.id }, 'JWT_SECRET_KEY', { expiresIn: '1h' })
  res.json({ access_token: token })
})

app.get('/api/auth/profile', jwtMiddleware, (req, res) => {
  const user = users.find(user => user.id === req.user.id)
  if (!user) return res.status(401).send('User not found')

  res.json(user)
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})