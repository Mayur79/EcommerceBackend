import express from 'express';
import { registerController, loginController, forgotPasswordController, testController, updateProfileController, getOrderController, getAllOrderController, orderStatusController, googleregisterController, googleLoginController } from '../controllers/authController.js';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';

// Router object
const router = express.Router();

// Routing
// Register || Method POST
router.post('/register', registerController);

// LOGIN || POST
router.post('/login', loginController);

// Forgot Password
router.post("/forgot-password", forgotPasswordController);

router.post('/storeUserData', googleregisterController);
router.post('/googleLogin', googleLoginController);
// Test routes
router.get('/test', requireSignIn, isAdmin, testController);

// Protected user route
router.get('/user-auth', requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
});

// Protected admin route
router.get('/admin-auth', requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({ ok: true });
});

// Update profile
router.put('/profile', requireSignIn, updateProfileController);

// Orders
router.get('/orders', requireSignIn, getOrderController);

// All orders
router.get('/all-orders', requireSignIn, isAdmin, getAllOrderController);

// Order status update
router.put('/order-status/:orderId', requireSignIn, isAdmin, orderStatusController);

export default router;
