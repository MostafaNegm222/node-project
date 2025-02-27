const mongoose=require('mongoose')

/// product Schema 
const productSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default:3,
        required: true
    }

});

// make the model
const Product = new mongoose.model("Product", productSchema)
module.exports = Product;  // export the model