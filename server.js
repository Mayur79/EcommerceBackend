import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import cors from 'cors';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoute from './routes/productRoute.js';
import session from 'express-session';

// import passportStrategy from "./passport.js"
//configure env
dotenv.config();

//rest object
const app = express();
//database config
connectDB();

//middleware
app.use(cors())
app.use(express.json());
app.use(morgan('dev'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
}));
//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoute);

app.get("/", (req, res) => {
    res.send("Welcome to my ecommerce backend");
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
})
