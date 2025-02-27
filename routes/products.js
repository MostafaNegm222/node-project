const express=require("express")
const router = express.Router()
const Product=require("../models/product")


// add product
router.post("/", async (req, res) => {

    try {
        if (await Product.findOne({ name: req.body.name })) {
            return res.status(400).json({
                message: "Product already exists. You can update stock"
            })
        }
        const product = new Product(req.body)
        await product.save()
        res.status(201).send(product)
    } catch (error) {
        res.status(400).send(error)
    }
})
    

// get all products

router.get("/", async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 })
        res.status(200).send(products)
    } catch (error) {
        res.status(500).send(error)
    }
})
    
// update product details

router.put("/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        if (!product) {
            res.status(404).send({ message: "Product not found" })
        } else {
            res.status(200).send(product)
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

// delete a product

router.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)
        if (!product) {
            res.status(404).send({ message: "Product not found" })
        } else {
            res.status(200).send({ message: "Product deleted successfully" })
        }
    } catch (error) {
        res.status(400).send(error)
    }
})
    
    
module.exports=router

