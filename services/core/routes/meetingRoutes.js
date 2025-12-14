const express = require('express')
const router = express.Router()
const {
    getAuth,
    handleOAuth2Callback,
    addEvent
} = require('../controllers/meetingsController')

router.post("/auth", getAuth);
router.get("/oauth2callback", handleOAuth2Callback);
router.post("/add-event", addEvent);

module.exports=router

