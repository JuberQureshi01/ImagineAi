
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const FormData = require('form-data');
const authMiddleware = require('../middleware/auth');

// Helper function to convert a base64 data URL to a Buffer
const dataURLtoBuffer = (dataurl) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return Buffer.from(u8arr);
};

// @route   POST /api/clipdrop/cleanup
// @desc    Remove an object from an image using a mask
router.post('/cleanup', authMiddleware, async (req, res) => {
    const { image_data_url, mask_data_url } = req.body;

    if (!image_data_url || !mask_data_url) {
        return res.status(400).json({ msg: 'Image and mask data are required.' });
    }

    try {
        const form = new FormData();
        form.append('image_file', dataURLtoBuffer(image_data_url), 'image.png');
        form.append('mask_file', dataURLtoBuffer(mask_data_url), 'mask.png');

        const response = await fetch('https://clipdrop-api.co/cleanup/v1', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...form.getHeaders()
            },
            body: form,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Clipdrop API Error: ${errorText}`);
        }

        const imageBuffer = await response.buffer();
        const imageDataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;

        res.json({ newImageUrl: imageDataUrl });

    } catch (error) {
        console.error("Clipdrop Cleanup Error:", error);
        res.status(500).send("Error cleaning up image.");
    }
});

// @route   POST /api/clipdrop/text-to-image
// @desc    Generate an image from a text prompt
router.post('/text-to-image', authMiddleware, async (req, res) => {
    const { prompt, style } = req.body;

    if (!prompt) {
        return res.status(400).json({ msg: 'A prompt is required.' });
    }

    try {
        const form = new FormData();
        form.append('prompt', `${prompt}, in the style of ${style}`);

        const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...form.getHeaders()
            },
            body: form,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Clipdrop API Error: ${errorText}`);
        }

        const imageBuffer = await response.buffer();
        const imageDataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;
        
        res.json({ imageUrl: imageDataUrl });

    } catch (error) {
        console.error("Clipdrop Text-to-Image Error:", error);
        res.status(500).send("Error generating image.");
    }
});

module.exports = router;