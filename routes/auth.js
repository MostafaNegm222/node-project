const express = require("express")
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const router = express.Router();

dotenv.config();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "User Already Exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User Registered Successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body;
        console.log("Searching for user...");
        const user = await User.findOne({ email }).lean();
        if (!user) {
            return res.status(404).json({ error: "Invalid Email or Password" });
        }
        const isMatching = await bcrypt.compare(password, user.password);
        if (!isMatching) {
            return res.status(404).json({ error: "Invalid Email or Password" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.json({ message: "Login successful", token, userId: user._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;