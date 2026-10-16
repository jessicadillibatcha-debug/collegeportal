
const express = require('express');

const {
    signup,
    login,
    createTeacher

} = require('../controllers/user.controller');

const router = express.Router();



router.post('/signup', signup);
router.post('/login', login);
router.post('/teachers', createTeacher);

module.exports = router;
