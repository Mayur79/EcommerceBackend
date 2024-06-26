import userModel from "../models/userModel.js";
import orderModel from '../models/orderModel.js';
import { comparePasword, hashPassword } from "../helpers/authhelper.js";
import JWT from "jsonwebtoken";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.body;
        //validation
        if (!name) {
            return res.send({ message: "Name is required" });
        }
        if (!email) {
            return res.send({ message: "Email is required" });
        }
        if (!password) {
            return res.send({ message: "Password is required" });
        }
        if (!phone) {
            return res.send({ message: "Phone is required" });
        }
        if (!address) {
            return res.send({ message: "Address is required" });
        }
        if (!answer) {
            return res.send({ message: "Answer is required" });
        }

        //check user
        const existinguser = await userModel.findOne({ email });

        //existing user
        if (existinguser) {
            return res.status(200).send({
                success: false,
                message: "Already register please login",
            })
        }

        //register user
        const hashedPassword = await hashPassword(password);
        //save
        const user = await new userModel({ name, email, phone, address, password: hashedPassword, answer }).save();
        res.status(203).send({
            success: true,
            message: "User register successfully",
            user
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Registration",
            error
        })
    }
};

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        //validation
        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: "Invalid email or password"
            })
        }
        //cheack user
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Email is not registerd"
            })
        }
        const match = await comparePasword(password, user.password);
        if (!match) {
            return res.status(200).send({
                success: false,
                message: "Invalid Password"
            })
        }

        //token
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.status(200).send({
            success: true,
            message: "Login successfully",
            user: {
                "_id": user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in login",
            error
        })
    }
}


// Rest of the code remains the same
export const googleregisterController = async (req, res) => {
    const { profile } = req.body;
    if (!profile) {
        return res.status(400).json({ error: 'Profile data is required.' });
    }

    // Create a new user document and save it to the database
    const newUser = new userModel({
        name: profile.name,
        email: profile.email,
        // Add other relevant properties from the `profile` object
    });

    newUser
        .save()
        .then((user) => {
            res.json({ success: true, user });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Failed to store user data.' });
        });
}


export const googleLoginController = async (req, res) => {
    const { profile } = req.body;
    if (!profile) {
        return res.status(400).json({ error: 'Profile data is required.' });
    }



    userModel.findOne({ email: profile.email })
        .then((user) => {
            if (user) {
                console.log('User login successfully');
                const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
                    expiresIn: '7d',
                });
                res.json({ success: true, user, token });
            } else {
                // User does not exist, send an error response
                res.status(404).json({ error: 'User not found.' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Failed to find user.' });
        });
};


export const testController = (req, res) => {
    res.send("Protected Route");
}

export const forgotPasswordController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body
        if (!email) {
            res.status(400).send({ message: 'Email is required' })
        }
        if (!answer) {
            res.status(400).send({ message: 'Answer is required' })
        }
        if (!newPassword) {
            res.status(400).send({ message: 'New Password is required' })
        }

        //check 
        const user = await userModel.findOne({ email, answer })
        //validation
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Wrong Email or Answer"
            })
        }
        const hashed = await hashPassword(newPassword)
        await userModel.findByIdAndUpdate(user._id, { password: hashed });
        res.status(200).send({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error
        })
    }
};

//update profile
export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, address, phone } = req.body;
        const user = await userModel.findById(req.user._id);
        //password
        if (password && password.length < 6) {
            return res.json({ error: "Password is required and 6 charcter long" })
        }
        const hashedPassword = password ? await hashPassword(password) : undefined
        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
            name: name || user.name,
            password: hashedPassword || user.password,
            phone: phone || user.phone,
            address: address || user.address
        }, { new: true })
        res.status(200).send({
            success: true,
            message: "Profile Updated Successfully",
            updatedUser
        })
    } catch (error) {
        res.status(400).send({
            success: false,
            message: "Error while update Successfully",
            error
        })
    }
};

export const getOrderController = async (req, res) => {
    try {
        const orders = await orderModel.find({ buyer: req.user._id }).populate("products", "-photo").populate("buyer", "name");
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while geting the orders",
            error

        })
    }
}
export const getAllOrderController = async (req, res) => {
    try {
        const orders = await orderModel.find({}).populate("products", "-photo").populate("buyer", "name").sort({ createdAt: "-1" });
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while geting the orders",
            error

        })
    }
};

//order status
export const orderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const orders = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
        res.json(orders);

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while updating order",
            error
        })
    }
}