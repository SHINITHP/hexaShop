const formDataMiddleware = (req, res, next) => {
    console.log('Form Data:', req.body,'sxdcfvgbhnjmfc'); // Access form data here
    next(); // Proceed to the next middleware or route handler
};

module.exports = formDataMiddleware