const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const users = require("../models/users");
const fs = require("fs");

// Image upload configuration
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single("image");

// Insert a user to the database
router.post("/add", upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        await user.save();

        req.session.message = {
            type: "success",
            message: "User added successfully!",
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});


// Get all users route
router.get("/", async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render("index", {
            title: "Home page",
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

router.get("/add", (req, res) => {
    res.render("add_user", { title: "Add Users" });
});

// Edit a user router
router.get("/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            res.redirect("/");
            return;
        }

        res.render("edit_user", {
            title: "Edit User",
            user: user,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error"); 
    }
});

// Update a user router
router.post("/update/:id", upload, async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            // Add other fields you want to update here
        };

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            res.redirect("/");
            return;
        }

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error"); // Handle the error more gracefully
    }
});

// Delete user route
router.get("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const user = await User.findById(id);

        if (!user) {
            res.json({ message: "User not found", type: "danger" });
            return;
        }

        if (user.image) {
            // Delete the user's image if it exists
            try {
                fs.unlinkSync("./uploads/" + user.image);
            } catch (err) {
                console.error(err);
            }
        }

        const deletedUser = await User.findByIdAndRemove(id);

        if (!deletedUser) {
            res.json({ message: "User not found", type: "danger" });
            return;
        }

        req.session.message = {
            type: "info",
            message: "User deleted successfully!",
        };
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error"); // Handle the error more gracefully
    }
});



module.exports = router;
