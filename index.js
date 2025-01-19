const express = require('express');
const cors = require('cors');
require('./db/config');
const User = require('./db/User');

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

app.listen(5000);