const express = require('express')
const {login, signUp} = require('../controllers/authController')

const router = express.Router()

router.post('/signup', signUp)
router.post('/login', login)

module.exports = router