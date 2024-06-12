const subCategorySchema = require('../../models/category.js')//category schema
const cloudinary = require('../../utils/cloudinary.js')
const fs = require('fs')
require('dotenv').config()


const category = async (req, res) => {
    try {
        switch (req.path) {
            case '/Category':
                // Find all categories
                const categoryData = await subCategorySchema.find({});
                res.render('admin/Category', { categoryData });
                break;
            case '/addCategory':
                res.render('admin/addCategory', { success: '' });
                break;
            default:
                if (req.params.id) {
                    // Find category by ID
                    const categoryData = await subCategorySchema.findById(req.params.id);
                    res.render('admin/editCategory', { categoryData, success: '' });
                }
                break;
        }
    } catch (error) {
        console.log(error)
    }
}

const categoryPost = async (req, res) => {
    try {
        const inventory = req.query.ID
        if (inventory) {
            const Category = await subCategorySchema.findById(inventory)
            console.log(Category);
            if (Category.Inventory === "Listed") {
                await subCategorySchema.findByIdAndUpdate(inventory, { Inventory: 'Unlisted' })
                res.redirect('/adminLogin/Category')
            }
            else if (Category.Inventory === "Unlisted") {
                await subCategorySchema.findByIdAndUpdate(inventory, { Inventory: 'Listed' })
                res.redirect('/adminLogin/Category')
            }
        }
    } catch (error) {
        console.log(error)
    }

}

//Post method for the category page 
const categoryEdit = async (req, res) => {
    try {
        //Uploading image to Clouddinary
        const uploader = async (path) => await cloudinary.uploads(path, 'Images')
        const urls = []
        const files = req.files
        if (req.files.length > 0) {
            for (const file of files) {
                const { path } = file
                try {
                    const newPath = await uploader(path)
                    urls.push(newPath)
                    fs.unlinkSync(path)
                } catch (uploadError) {
                    console.error('Error uploading file to Cloudinary:', uploadError)
                    return res.status(500).json({ error: 'Failed to upload images' })
                }
            }
        }
        const imagePaths = urls
        const finalImage = imagePaths
        const oldData = await subCategorySchema.findById(req.params.id)
        const imgData = []
        imgData.push(oldData.image)

        // requesting data form the body
        const {
            CategoryName,
            subCategory
        } = req.body

        const isExist = await subCategorySchema.findOne({
            CategoryName,
            subCategory,
            image: finalImage.length > 0 ? urls : oldData.image
        })
        //assigning reqested data to the category variable
        const category = {
            CategoryName,
            subCategory,
            image: finalImage.length > 0 ? urls : oldData.image
        }
        //save the updated data to the database
        try {

            if (!isExist) {
                console.log(category);
                await subCategorySchema.findOneAndUpdate({ _id: req.params.id }, { $set: category }).then((result) => {
                    console.log('result :', result);
                }).catch(error => {
                    console.log(error);
                });
                const categoryData = await subCategorySchema.findById(req.params.id)
                res.render('admin/editCategory', { success: 'Category Edit Successfully', categoryData })
            } else {
                const categoryData = await subCategorySchema.findById(req.params.id)
                console.log(categoryData)
                res.render('admin/editCategory', { categoryData, success: 'Category Already Exist' })
            }

        } catch (saveError) {
            console.error('Error saving product to database:', saveError)
            res.status(500).json({ error: 'Failed to save product to database' })
        }
    } catch (error) {
        console.log('Admin controller error:', error)
    }
}


//Post method for addCategory page
const postAddCategory = async (req, res) => {
    try {
        const uploader = async (path) => await cloudinary.uploads(path, 'Images')
        if (req.method === 'POST') {
            const urls = []
            const files = req.files
            for (const file of files) {
                const { path } = file
                try {
                    const newPath = await uploader(path)
                    urls.push(newPath)
                    fs.unlinkSync(path)
                } catch (uploadError) {
                    console.error('Error uploading file to Cloudinary:', uploadError)
                    return res.status(500).json({ error: 'Failed to upload images' })
                }
            }
            // requesting data from the body
            const { CategoryName, subCategory } = req.body

            const isExist = await subCategorySchema.findOne({
                CategoryName,
                subCategory
            })

            console.log(isExist)
            const Category = {
                CategoryName,
                subCategory,
                image: urls
            }
            //add data to the database
            try {
                console.log(Category);
                if (!isExist) {
                    await subCategorySchema.create(Category);
                    res.render('admin/addCategory', { success: 'Category Added Successfully' })
                } else {
                    res.render('admin/addCategory', { success: 'Category Already Exist' })
                }


            } catch (saveError) {
                console.error('Error saving product to database:', saveError)
                res.status(500).json({ error: 'Failed to save product to database' })
            }
        } else {
            res.status(405).json({
                error: 'Images not uploaded!'
            })
        }
    } catch (error) {
        console.log('Admin controller error:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

const filterCategory = async (req, res) => {
    try {
        if (req.query.Category == 'All') {
            try {
                const categoryData = await subCategorySchema.find({});
                res.render('admin/Category', { categoryData })
            } catch (error) {
                console.log(error)
            }

        }
        else if (req.query.task == 'subCat') {
            try {
                const categoryData = await subCategorySchema.find({ CategoryName: req.query.Category });
                res.render('admin/Category', { categoryData })
            } catch (error) {
                console.log(error)
            }
        }
        else if (req.query.Category == 'search') {
            try {
                let data = req.query.text;
                const searchText = new RegExp("^" + data, "i")
                const categoryData = await subCategorySchema.find({ subCategory: { $regex: searchText } })
                res.render('admin/Category', { categoryData })
            } catch (error) {
                console.log(error)
            }

        }
    } catch (error) {
        console.log(error)
    }

}

module.exports = {
    category, categoryPost, categoryEdit, postAddCategory,filterCategory
}