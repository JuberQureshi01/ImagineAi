
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('AI Photo Editor API is running...'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects')); 
app.use('/api/imagekit', require('./routes/imagekit'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/ai', require('./routes/ai')); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
