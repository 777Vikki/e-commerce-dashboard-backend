const express = require('express');
const cors = require('cors');
require('./db/config');
const User = require('./db/User');
const Product = require('./db/Product');

const app = express();

app.use(express.json());
app.use(cors());

app.post("/register", async (req, res) => {
    const user = new User(req.body);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(user.name && user.name.trim() && user.password && user.password.trim() && user.email && emailRegex.test(user.email)) {
        let result = await user.save();
        result = result.toObject();
        delete result.password;
        const responseResult = {
            result: true,
            message: 'successful',
            messageType: 'SUCCESS',
            data: [result]
        }
        res.send(responseResult);
    } else {
        const responseResult = {
            result: false,
            data: [],
            messageType: 'EMPTY_FIELD',
            message: 'Either email or password or name are not available',
        }
        res.send(responseResult);
    }
});

app.post("/login", async (req, res) => {
    if(req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select("-password");
        if(user) {
            const responseResult = {
                result: true,
                message: 'successful',
                messageType: 'SUCCESS',
                data: [user]
            }
            res.send(responseResult);
        } else {
            const responseResult = {
                result: false,
                data: [],
                messageType: 'NO_USER',
                message: 'No user found.',
            }
            res.send(responseResult);
        }
    } else {
        const responseResult = {
            result: false,
            data: [],
            messageType: 'EMPTY_FIELD',
            message: 'Either email or password are not available',
        }
        res.send(responseResult);
    }
    
});

app.post("/product", async (req, res) => {
    let product = new Product(req.body);
    let result = await product.save();
    const responseResult = {
        result: true,
        message: 'successful',
        messageType: 'SUCCESS',
        data: [result]
    }
    res.send(responseResult);
});

app.get("/product/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Find the product by its ID
        const product = await Product.find({ userId: id });

        if (!product) {
            // If no product is found, return a not found response
            return res.status(404).send({
                result: false,
                message: 'Product not found',
                messageType: 'ERROR',
                data: null
            });
        }

        // If the product is found, return it
        const responseResult = {
            result: true,
            message: 'Product retrieved successfully',
            messageType: 'SUCCESS',
            data: product
        };

        res.send(responseResult);
    } catch (error) {
        // Handle any errors (e.g., invalid ID format or database issues)
        res.status(500).send({
            result: false,
            message: 'An error occurred while retrieving the product',
            messageType: 'ERROR',
            data: null
        });
    }
});

app.delete("/product/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Find and delete the product by its ID
        const deleteProduct = await Product.deleteOne({ _id: id });

        if (deleteProduct.deletedCount === 0) {
            // If no product is found to delete, return a not found response
            return res.status(404).send({
                result: false,
                message: 'Product not found',
                messageType: 'ERROR',
                data: null
            });
        }

        // If the product is found and deleted, return a success response
        const responseResult = {
            result: true,
            message: `${deleteProduct.deletedCount} Product(s) deleted successfully`,
            messageType: 'SUCCESS',
        };

        res.send(responseResult);
    } catch (error) {
        // Handle any other errors (e.g., database issues)
        console.error(error);  // Log the error for debugging purposes
        res.status(500).send({
            result: false,
            message: 'An error occurred while deleting the product',
            messageType: 'ERROR',
            data: null
        });
    }
});

app.get("/product-detail/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Find the product by its ID
        const product = await Product.find({ _id: id });

        if (!product) {
            // If no product is found, return a not found response
            return res.status(404).send({
                result: false,
                message: 'Product not found',
                messageType: 'ERROR',
                data: null
            });
        }

        // If the product is found, return it
        const responseResult = {
            result: true,
            message: 'Product retrieved successfully',
            messageType: 'SUCCESS',
            data: product
        };

        res.send(responseResult);
    } catch (error) {
        // Handle any errors (e.g., invalid ID format or database issues)
        res.status(500).send({
            result: false,
            message: 'An error occurred while retrieving the product',
            messageType: 'ERROR',
            data: null
        });
    }
});

app.put("/product-detail/:id", async (req, res) => {
    const { id } = req.params;  // Extract the product ID from the URL
    const updatedData = req.body; // Extract the updated product data from the request body

    try {
        // Find the product by its ID and update it
        const product = await Product.findByIdAndUpdate(id, updatedData, { new: true });

        if (!product) {
            // If no product is found, return a not found response
            return res.status(404).send({
                result: false,
                message: 'Product not found',
                messageType: 'ERROR',
                data: null
            });
        }

        // If the product is successfully updated, return the updated product
        const responseResult = {
            result: true,
            message: 'Product updated successfully',
            messageType: 'SUCCESS',
            data: product
        };

        res.send(responseResult);
    } catch (error) {
        // Handle any errors (e.g., invalid ID format, validation errors, or database issues)
        res.status(500).send({
            result: false,
            message: 'An error occurred while updating the product',
            messageType: 'ERROR',
            data: null
        });
    }
});

app.get("/search/:id", async(req, res) => {
    const { id } = req.params;
    const { key } = req.query;
    try {
        const findDetail = { userId: id };
        if(key) {
            findDetail['$or'] = [
                { name : {$regex: key, $options: 'i'}},
                { company : {$regex: key, $options: 'i'}},
                { category : {$regex: key, $options: 'i'}},
                { price : {$regex: key, $options: 'i'}},
            ]
        }
        const product = await Product.find(findDetail);

        if (!product) {
            // If no product is found, return a not found response
            return res.status(404).send({
                result: false,
                message: 'Product not found',
                messageType: 'ERROR',
                data: null
            });
        }

        // If the product is found, return it
        const responseResult = {
            result: true,
            message: 'Product retrieved successfully',
            messageType: 'SUCCESS',
            data: product
        };

        res.send(responseResult);
    } catch (error) {
        // Handle any errors (e.g., invalid ID format or database issues)
        res.status(500).send({
            result: false,
            message: 'An error occurred while retrieving the product',
            messageType: 'ERROR',
            data: null
        });
    }

});


app.listen(5000);