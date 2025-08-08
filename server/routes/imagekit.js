
const express = require('express');
const router = express.Router();
const ImageKit = require('imagekit');
const authMiddleware = require('../middleware/auth');

// Initialize ImageKit with your credentials from the .env file
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// @route   GET /api/imagekit/auth
// @desc    Provide authentication parameters for client-side upload
router.get('/auth', authMiddleware, (req, res) => {
    try {
        // This function securely generates a temporary token and signature
        const authenticationParameters = imagekit.getAuthenticationParameters();
        res.json(authenticationParameters);
    } catch (err) {
        console.error("ImageKit Auth Error:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
