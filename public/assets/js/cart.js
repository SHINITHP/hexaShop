
const cartTotal = document.getElementById('cartTotal')
const totalAmount = document.querySelectorAll('.TotalAmount');
const discount = document.querySelectorAll('.discount');

const availability = document.querySelectorAll('.availability')

for (let i = 0; i < availability.length; i++) {

    if (availability[i].innerText === 'In Stock') {
        availability[i].style.color = 'green'
    } else {
        availability[i].style.color = 'red'
    }

}



const Qty = document.querySelectorAll('.Qty')
const dec = document.querySelectorAll('.dec') 
for(let i =0;i<Qty.length;i++){
    if(Qty[i].value == 1){
        dec[i].disabled = true
    }
}

const TotalAmount = document.querySelectorAll('.TotalAmount')


const salesRate = document.querySelectorAll('.salesRate')
let totalDiscount =0,totalMrp=0;
for(let i=0;i<salesRate.length;i++){
    totalDiscount += parseFloat(discount[i].innerText) - parseFloat(salesRate[i].innerText) 
    console.log('totalDiscount',totalDiscount)
    // document.getElementById('discountAmt').value = totalDiscount
    totalMrp += parseFloat(discount[i].innerText)
    // cartTotal.value = parseFloat(document.getElementById('ExactPrice').value)-totalDiscount
}




function quantityIncDec(index,id, Products, type) {
    console.log('quantityIncDec')
    const showQty = document.getElementById(`showQty${index}`)
    const totalInput = document.getElementById(`totalPrice${index}`)
    const discountAmt = document.getElementById(`discount${index}`)
    let product = JSON.parse(Products)
    console.log('product ',product)
    let productDetails = product.filter((val) => val._id === id)

    
    let price = productDetails[0].productID.SalesRate;
    // let proDiscount = productDetails[0].productID.MRP  - productDetails[0].productID.SalesRate 
    // let MRP = productDetails[0].productID.MRP
    
    // console.log('productDetails ',proDiscount)
    let ExactDiscAmt;
    if (type === 'increment') {
        console.log('increment')
        let quantity = parseFloat(showQty.value)
        // showQty.value = 
        let addQty = quantity + 1

        axios.patch('/shoppingcart', { newQty:addQty ,id,type}) // Sending productID as data
        .then(function (response) {
            console.log('Product added to cart successfully', response);
            // Handle success response if needed
            
            if(response.data ==='finished'){
                // location.href = '/shoppingcart'
                document.getElementById(`increment${index}`).disabled = true;
                document.getElementById(`error${index}`).innerText='Stock Unavailable!'
            }else{
                location.href = '/shoppingcart'
            }
        })
        .catch(function (error) {
            console.error('Error adding product to cart:', error);
            // Handle error if needed
        });
    }
    else if (type === 'decrement') {
        console.log('decrement')
        if(showQty.value ==2){
            document.getElementById(`decrement${index}`).disabled = true;
        }
        let quantity = parseFloat(showQty.value)
        showQty.value = quantity - 1
        let addQty = parseFloat(showQty.value)
        // totalInput.value = price*addQty

        axios.patch('/shoppingcart', { newQty:addQty ,id,type}) // Sending productID as data
        .then(function (response) {
            console.log('Product added to cart successfully', response);
            // Handle success response if needed
            window.location.href = '/shoppingcart';
        })
        .catch(function (error) {
            console.error('Error adding product to cart:', error);
            // Handle error if needed
        });
    }
}





function saveOrder(data) {
    let discountAmt = document.getElementById('discountAmt').value
    let total = document.getElementById('cartTotal').value;
    let availability = document.querySelectorAll('.availability')
    let flag = 0;
    availability.forEach(element => {
        if(element.innerText === 'Out Of Stock'){
            flag=1
        }else{
            flag = 0 
        }
    });
    console.log(flag)
    if(flag == 0){
        axios.post('/shoppingcart', { cartData: data ,discountAmt,total}) // Sending productID as data
        .then(function (response) {
            console.log('Product added to cart successfully', response);
            // Handle success response if needed
            console.log('I am here...',response);
            if(response.data.message === 'error'){
                Swal.fire({
                    icon: 'info',
                    title: '<span style="color: red;font-size:9pt;">Regrettably,One of the product is currently out of stock.!</span>',
                    timer: 4000, // Duration in milliseconds
                    toast: true,
                    position: 'top', // Toast position
                    showConfirmButton: false
                });

            
            }else{
                location.href ='/checkOut'  
            }
                

        })
        .catch(function (error) {
            console.error('Error adding product to cart:', error);
            // Handle error if needed
        });
    }else{
        Swal.fire({
            icon: 'info',
            title: '<span style="color: red; font-size:10pt;">Regrettably,One of the product is currently out of stock.!</span>',
            timer: 4000, // Duration in milliseconds
            toast: true,
            position: 'top', // Toast position
            showConfirmButton: false
        });
    }
    
}




function cartError(){
    Swal.fire({
        icon: 'info',
        title: '<span style="color: red">Your Cart is Empty!</span>',
        timer: 4000, // Duration in milliseconds
        toast: true,
        position: 'top', // Toast position
        showConfirmButton: false
    });
}