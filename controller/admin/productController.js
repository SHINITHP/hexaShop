const ProductModel = require('../../models/products.js')//product schema
const subCategorySchema = require('../../models/category.js')//category schema
const fs = require('fs')
require('dotenv').config()
const cloudinary = require('../../utils/cloudinary.js')



//productlist get method
const productList = async (req, res) => {
    try {
        let productDetails,subCategory,productInfo;
        switch (req.path) {
            case '/ProductList':
                productDetails = await ProductModel.find({});
                res.render('admin/ProductList', { productDetails, message: ' ' });
                break;
            case '/ProductList/addProducts':
                subCategory = await subCategorySchema.distinct('subCategory');
                res.render('admin/addProducts', { subCategory, success: '' });
                break;
            case '/editProducts':
                subCategory = await subCategorySchema.distinct('subCategory');
                productInfo = await ProductModel.findById(req.query.id);
                res.render('admin/editProducts', { subCategory, productInfo, success: '' });
                break;
            default:
                res.status(404).send('Not Found');
                break;
        }
    } catch (error) {
     console.log(error)   
    }
    

}


//Post method for ProductList search
const productSearch = async (req, res) => {
    try {
        const searchedData = req.body.search
        const productDetails = await ProductModel.find({ ProductName: searchedData })
        const subCategory = await subCategorySchema.find({})
        if (productDetails == "") {
            console.log('empty');
            res.render('admin/ProductList', { productDetails, message: 'No Result Found!' })
        } else {
            console.log('hiii iam here');
            res.render('admin/ProductList', { productDetails, message: ' ' })
        }
    } catch (error) {
        console.log('Error from ProductSearch ', error);
    }
}

//for listed and unlisted in ProductList page
const productListEdit = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.query.ID)
        if (product.Inventory === "Listed") {
            await ProductModel.findByIdAndUpdate(req.query.ID, { Inventory: 'Unlisted' })
            res.redirect('/adminLogin/ProductList')
        }
        else if (product.Inventory === "Unlisted") {
            await ProductModel.findByIdAndUpdate(req.query.ID, { Inventory: 'Listed' })
            res.redirect('/adminLogin/ProductList')
        }
    } catch (error) {
        console.log(error);
    }

}

const addProductsPost = async (req, res) => {
    try {
        const uploader = async (path) => await cloudinary.uploads(path, 'Images')
        const urls = [];
        const imageData = Array.isArray(req.body.imageLinks) ? req.body.imageLinks : [req.body.imageLinks];
        for (const imageUrl of imageData) {
            try {
                const newPath = await uploader(imageUrl);
                urls.push(newPath);
            } catch (error) {
                console.log(error)
            }
        }
        const {
            ProductName, BrandName, CategoryName, StockQuantity, subCategory,
            PurchaseRate, SalesRate, ColorNames,
            ProductDescription, VATAmount, mrp, sizes
        } = req.body

        // Prepare sizes array
        const ProductSize = sizes.map((size, index) => ({
            size,
            quantity: req.body.SizeQuantity[index]
        }));

        //assigning all the reqested data to product variable
        const Products = {
            ProductName, BrandName, CategoryName, StockQuantity, subCategory,
            PurchaseRate, SalesRate, ColorNames, ProductDescription,
            VATAmount, MRP: mrp, ProductSize, files: urls
        }
        try {
            await ProductModel.create(Products);
            const subCategory = await subCategorySchema.distinct('subCategory');
            res.render('admin/addProducts', { subCategory, success: 'Product Added Successfully' })
        } catch (saveError) {
            console.error('Error saving product to database:', saveError)
            res.status(500).json({ error: 'Failed to save product to database' })
        }

    } catch (error) {
        console.error('Error adding products:', error);
        res.status(500).json({ error: 'Failed to add products' });
    }
};
const postEditProduct = async (req, res) => {
    try {

        if (req.query.task === 'deleteImage') {
            try {
                const id = req.body.id;
                const index = req.body.index;

                // Find the product document by its ID
                const product = await ProductModel.findById(id);

                // Access the files array and remove the element at the specified index
                if (product) {
                    product.files.splice(index, 1); // Remove 1 element at the specified index

                    // Update the product document in the database to reflect the changes
                    await ProductModel.findByIdAndUpdate(id, { files: product.files });

                    console.log('Image deleted successfully');
                    res.json({ message: 'success' })
                } else {
                    console.log('Product not found');
                }
            } catch (error) {
                console.log('Error deleting image:', error);
            }
        } else {
            const imageData = Array.isArray(req.body.imageLinks) ? req.body.imageLinks : [req.body.imageLinks];
            const oldData = await ProductModel.findById(req.query.id);
            const imgData = []
            oldData.files.forEach((val) => imgData.push(val))
            const uploader = async (path) => await cloudinary.uploads(path, 'Images');
            const urls = []
            if (imageData.length > 0) {
                for (const imageUrl of imageData) {
                    try {
                        const newPath = await uploader(imageUrl);
                        urls.push(newPath);
                    } catch (error) {
                        console.log(error)
                    }
                }

            }
            if (urls.length > 0) {
                urls.forEach((val) => imgData.push(val))
            }

            const {
                ProductName, BrandName, CategoryName, StockQuantity, subCategory,
                PurchaseRate, SalesRate, TotalPrice, ColorNames,
                ProductDescription, VATAmount, DiscountPrecentage, sizes
            } = req.body

            // Prepare sizes array
            let ProductSize = sizes.map((size, index) => ({
                size,
                quantity: req.body.SizeQuantity[index]
            }));
            //assigning all the reqested data to product variable
            const Products = {
                ProductName,
                BrandName,
                CategoryName,
                StockQuantity,
                subCategory,
                PurchaseRate,
                SalesRate,
                TotalPrice,
                ColorNames,
                ProductDescription,
                VATAmount,
                DiscountPrecentage,
                ProductSize,
                files: imgData
            };
            try {
                await ProductModel.findOneAndUpdate({ _id: req.query.id }, { $set: Products }).then((result) => {
                }).catch(error => {
                    console.log(error);
                });
                const subCategory = await subCategorySchema.distinct('subCategory');
                const productInfo = await ProductModel.findById(req.query.id)
                res.render('admin/editProducts', { subCategory, productInfo, success: 'Product Successfully Edited' })

            } catch (saveError) {
                console.error('Error saving product to database:', saveError)
                res.status(500).json({ error: 'Failed to save product to database' })
            }

        }
    } catch (error) {
        console.log('Admin controller error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = {
    productList,productListEdit ,addProductsPost,postEditProduct,productSearch
}