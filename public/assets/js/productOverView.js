function Wishlist(element, productID) {

    let i = element.getAttribute('data-index');
    console.log(element)
    let removeIcon = element.querySelector('.remove');
    let add = element.querySelector('.add');
    if (removeIcon.style.display === 'none') {


        axios.post('/productOverview?task=wishlist', { productID }) // Sending productID as data
            .then(function (response) {
                console.log('hiewjfjnjd ',response.data.message,response)

                if(response.data.message ==='' || response.data.message === undefined){
                    window.location.href ='/login'
                }else{
                    removeIcon.style.display = 'inline'; // or 'block' depending on your needs
                    add.style.display = 'none'; // or 'block' depending on your needs
    
                    Swal.fire({
                        icon: 'success',
                        text: 'Successfully added to wishlist!',
                        timer: 4000, // Duration in milliseconds
                        toast: true,
                        position: 'top', // Toast position
                        showConfirmButton: false // Hide confirmation button
                    });
                }

            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });

    } else {
        removeIcon.style.display = 'none';
        add.style.display = 'inline';

        Swal.fire({
            icon: 'info',
            text: 'Successfully Removed from wishlist!',
            timer: 4000, // Duration in milliseconds
            toast: true,
            position: 'top', // Toast position
            showConfirmButton: false // Hide confirmation button
        });
        axios.delete('/productOverview?task=Removewishlist', { data: { productID: productID } }) // Sending productID as data
            .then(function (response) {
            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });
    }
    // element.style.display='none'
    // document.getElementById('addWishlist'+i).style.display='inline-block'
}
let quantity = document.getElementById('quantity');
quantity.value = "1";
let totalQty = quantity.value;
let size;

document.querySelector('.inc .qtybtn', addEventListener('click', function () {
    quantity.value + 1;
    console.log(quantity)
    console.log("q :", quantity.value)
    totalQty = quantity.value
}))
const Availability = document.getElementById('stockAvailability');
if (Availability.innerText === 'Out ofStock') {
    document.getElementById('stockAvailability').style.color = 'red'
    document.getElementById('shopingCartBtn').style.display = 'none'
    document.getElementById('errorBtn').style.display = 'block'
} else {
    document.getElementById('stockAvailability').style.color = 'green'
    document.getElementById('errorBtn').style.display = 'none'
    document.getElementById('shopingCartBtn').style.display = 'block'
}
document.getElementById('errorBtn').addEventListener('click', function () {
    Swal.fire({
        icon: 'info',
        title: '<span style="color: red">We are sorry, but the item is currently out of stock!</span>',
        timer: 4000, // Duration in milliseconds
        toast: true,
        position: 'top', // Toast positionWe
        showConfirmButton: false
    });
})


function CheckSizeStock(product, index) {
    const allInputs = document.querySelectorAll('.sizeInput');
    allInputs.forEach((item) => {
        item.classList.remove("focuscolor");
    })
    size = document.getElementById(`xs-btn${index}`).value
    const sizeBtn = document.getElementById(`sizeBtn${index}`)
    const stockAvailability = document.getElementById('stockAvailability')
    sizeBtn.classList.add("focuscolor");
    let btnShoppingCart = document.getElementById('shopingCartBtn');
    let outOFStockBtn = document.getElementById('errorBtn')


    const productdata = JSON.parse(product);


    if (productdata) {
        console.log('productdata', productdata[0].ProductSize[index].quantity)
        const sizeQty = productdata[0].ProductSize[index].quantity;
        console.log(sizeQty)
        if (sizeQty <= '0') {
            console.log('iam heree..')
            stockAvailability.innerHTML = 'Out Of Stock'
            stockAvailability.style.color = 'red'
            btnShoppingCart.style.display = 'none'
            outOFStockBtn.style.display = 'block'
        } else {
            stockAvailability.innerHTML = 'In Stock'
            stockAvailability.style.color = 'green'
            btnShoppingCart.style.display = 'block'
            outOFStockBtn.style.display = 'none'
        }

    } else {
        console.log("Product or ProductSize array not found.");
    }
}



function shoppingCart(index, productID, Price, discount) {
    const proDiscount = Price * discount / 100
    let btnShoppingCart = document.getElementById('shopingCartBtn');

    console.log('I am here...');
    axios.post('/productOverview?task=addToCart', { productID, Price, quantity: totalQty, size, proDiscount }) // Sending productID as data
        .then(function (response) {
            location.href ='/shoppingCart'
        })
        .catch(function (error) {
            console.error('Error adding product to cart:', error);
            // Handle error if needed
        });
}

