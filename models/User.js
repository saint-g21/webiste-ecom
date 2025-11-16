const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const cartItemSchema = new mongoose.Schema({
    fullName: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    image: {
        type: String,
        default: 'fas fa-box',
    },
    category: {
        type: String,
        required: true
    },
},{timestamps: true});

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters'],
        maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [15, 'Username cannot exceed 15 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    cart: [cartItemSchema],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    profile: {
        phone: String,
        address: String,
        city: String,
        country: String,
        zipCode: String,
        avatar: {
            type: String,
            default: 'default-avatar.png'
        }
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Check if account is locked
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return await this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }
    
    // Otherwise, increment
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + (2 * 60 * 60 * 1000) }; // 2 hours
    }
    
    return await this.updateOne(updates);
};

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (this.isLocked) {
        throw new Error('Account is temporarily locked due to too many failed login attempts. Please try again later.');
    }
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    if (isMatch) {
        // Reset login attempts on successful login
        if (this.loginAttempts > 0 || this.lockUntil) {
            await this.updateOne({
                $set: { loginAttempts: 0, lastLogin: new Date() },
                $unset: { lockUntil: 1 }
            });
        }
        return true;
    } else {
        // Increment login attempts on failed login
        await this.incrementLoginAttempts();
        return false;
    }
};

//add cart item method
userSchema.methods.addToCart = function(item) {
    const existingItemIndex = this.cart.find(item =>
        item.productId.toString() === item.productId.toString() &&
        item.category === item.category
    );

    if (existingItemIndex) {
        existingItemIndex.quantity += item.quantity || 1;
        } else {
        // Item doesn't exist in cart, add it
        this.cart.push({
            productId: item.productId,
            fullName: item.fullName,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image,
            category: item.category
        });
    }

    return this.save();
};

//remove cart item method
userSchema.methods.removeFromCart = function(itemId, category) {
    this.cart = this.cart.filter(item => 
        !(item.productId.toString() === itemId.toString() && item.category === category)
    );
    return this.save();

};

//update cart item quantity method
userSchema.methods.updateCartItemQuantity = function(itemId, category, quantity) {
    const item = this.cart.find(item => 
        item.productId.toString() === itemId.toString() && item.category === category
    );

    if (item) {
        if (quantity <= 0) {
            // Remove item if quantity is zero or less
            return this.removeFromCart(itemId, category);
        }

        item.quantity = quantity;
    }
    return this.save();
};

//clear cart method
userSchema.methods.clearCart = function() {
    this.cart = [];
    return this.save();
};
// Remove password from JSON output
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.loginAttempts;
    delete userObject.lockUntil;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);