const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

//? Middleware
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

//? Dynamically set static folder paths based on the base URL
const BASE_URL = process.env.BASE_URL;  // This will be the ngrok URL or production URL

app.use('/image/products', express.static('public/products'));
app.use('/image/category', express.static('public/category'));
app.use('/image/poster', express.static('public/posters'));

// Set MongoDB URL using environment variable
const URL = process.env.MONGO_URL;
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => {
    console.log('Connected to Database');
    
    // Call function to update existing image URLs to the BASE_URL (ngrok or production URL)
    updateExistingImageUrls();
});

// Function to update existing product image URLs in MongoDB
async function updateExistingImageUrls() {
    const Product = mongoose.model('Product'); // Assuming you have a Product model

    try {
        const products = await Product.find({});

        products.forEach(async (product) => {
            if (product.images) {
                product.images.forEach((image) => {
                    if (image.url && image.url.startsWith('http://localhost')) {
                        // Update the image URL to use BASE_URL
                        image.url = image.url.replace('http://localhost', BASE_URL);
                    }
                });
                
                // Save the updated product
                await product.save();
            }
        });

        console.log('Updated all image URLs in MongoDB successfully.');
    } catch (error) {
        console.error('Error updating image URLs: ', error);
    }
}

// Routes
app.use('/categories', require('./routes/category'));
app.use('/subCategories', require('./routes/subCategory'));
app.use('/brands', require('./routes/brand'));
app.use('/variantTypes', require('./routes/variantType'));
app.use('/variants', require('./routes/variant'));
app.use('/products', require('./routes/product'));
app.use('/couponCodes', require('./routes/couponCode'));
app.use('/posters', require('./routes/poster'));
app.use('/users', require('./routes/user'));
app.use('/orders', require('./routes/order'));
app.use('/payment', require('./routes/payment'));
app.use('/notification', require('./routes/notification'));

// Example route using asyncHandler directly in app.js
app.get('/', asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'API working successfully', data: null });
}));

// Global error handler
app.use((error, req, res, next) => {
    res.status(500).json({ success: false, message: error.message, data: null });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
