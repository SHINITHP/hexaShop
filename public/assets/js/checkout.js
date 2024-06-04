const amount = document.getElementById('toTalAmount').innerText
const confirmation = document.querySelector('.confirmation')
const SuccessRow = document.querySelector('.SuccessRow')
const Selectpayment = document.getElementById('Selectpayment');
const onlinePayment = document.getElementById('onlinePayment');
let couponDiscount = 0;

let payableAmount = parseFloat(document.getElementById('cartTotal').innerText) - parseFloat(document.getElementById('discountAmt').innerText);
if (payableAmount >= 2000) {
    document.getElementById('deliveryCharge').innerHTML = 0;
} else if (payableAmount <= 500) {
    document.getElementById('deliveryCharge').innerHTML = 50;
} else {
    document.getElementById('deliveryCharge').innerHTML = 40;
}


document.getElementById('toTalAmount').innerHTML = parseFloat(document.getElementById('cartTotal').innerText) - parseFloat(document.getElementById('discountAmt').innerText) + parseFloat(document.getElementById('deliveryCharge').innerText)

let AppliedCode;
function applyCouuponCode() {
    const couponCode = document.getElementById('couponCode').value
    AppliedCode = couponCode
    console.log('couponCode :', couponCode)
    document.getElementById('couponCode').value = ''
    axios.post('checkOut?task=checkCoupon', { couponCode })
        .then((response) => {
            if (response.data.error === 'Coupon Is Already Applied') {
                document.getElementById('couponCode').value = response.data.error
                document.getElementById('couponCode').style.color = 'red'
            } else if (response.data.error === 'Coupon Is Already Expired') {
                document.getElementById('couponCode').value = response.data.error
                document.getElementById('couponCode').style.color = 'red'
            } else {
                console.log(response)
                couponDiscount = response.data.message
                let discountAmt = document.getElementById('discountAmt').innerText
                let total = document.getElementById('toTalAmount').innerText;
                let discount = total * response.data.message / 100
                console.log(discount)
                document.getElementById('discountAmt').innerHTML = parseFloat(discountAmt) + parseFloat(discount);
                document.getElementById('toTalAmount').innerHTML = parseFloat(total) - parseFloat(discount);
            }
        })
        .catch((err) => {
            console.log(err)
        })
}

function AddMoneyTOWallet(user) {
    let userInfo = JSON.parse(user)
    const AddAmount = document.getElementById('AddAmount').value;
    axios.post('/create-payment', { amount: AddAmount })
        .then(function (response) {
            const responseData = response.data;
            console.log(responseData.amount)
            const options = {
                key: 'rzp_test_TrCYwkpURRftvO',
                amount: responseData.amount,
                currency: 'INR',
                description: 'Add Money To Wallet',
                wallet_id: responseData.id,
                handler: function (response) {

                    console.log(userInfo, 'addressID')
                    axios.post('/checkOut?task=AddToWallet', { AddAmount }) // Sending productID as data
                        .then(function (response) {
                            // Handle success response if needed
                        })
                        .catch(function (error) {
                            console.error('Error adding product to cart:', error);
                            // Handle error if needed
                        });
                },
                prefill: {
                    name: userInfo[0].fullName, // Pre-fill customer's name
                    email: userInfo[0].emailAddress, // Pre-fill customer's email
                    contact: userInfo[0].phoneNo // Pre-fill customer's contact number
                },
                theme: {
                    color: '#3399cc' // Customize color
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();


        })
}


function RazorPayment(product, user) {
    let productDetails = JSON.parse(product);
    let userInfo = JSON.parse(user);
    // console.log(userInfo[0].phoneNo);
    // Create an order on the server
    const totalAmt = document.getElementById('toTalAmount').innerText;
    axios.post('/create-payment', { amount: totalAmt })
        .then(function (response) {
            // Handle success response if needed
            const responseData = response.data;
            console.log(responseData.amount);
            // Initialize Razorpay checkout
            const options = {
                key: 'rzp_test_TrCYwkpURRftvO',
                amount: responseData.amount,
                currency: 'INR',
                name: productDetails.ProductName,
                description: 'Payment for your service',
                order_id: responseData.id,
                handler: function (response) {
                    confirmation.style.display = 'none';
                    let blur = document.getElementById('blur');
                    blur.classList.toggle('active');
                    let popup = document.getElementById('SuccessDiv');
                    popup.classList.toggle('active');
                    SuccessRow.style.display = 'flex';

                    const addressID = userInfo.map((val) => val._id);
                    console.log(userInfo, 'addressID');
                    const paymentMethod = Selectpayment.checked ? 'Cash On Delivery' : 'Online Payment';
                    let deliveryCharge = document.getElementById('deliveryCharge').innerText;
                    axios.post('/checkOut?task=RazorPay', {
                        amount: totalAmt,
                        AppliedCode,
                        ProductData: product,
                        paymentMethod: paymentMethod,
                        addressID,
                        couponDiscount,
                        deliveryCharge
                    })
                        .then(function (response) {
                            // Handle success response if needed
                        })
                        .catch(function (error) {
                            console.error('Error during checkout:', error);
                            // Handle error if needed
                        });
                },
                prefill: {
                    name: userInfo[0].fullName, // Pre-fill customer's name
                    email: userInfo[0].emailAddress, // Pre-fill customer's email
                    contact: userInfo[0].phoneNo // Pre-fill customer's contact number
                },
                theme: {
                    color: '#3399cc' // Customize color
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();
            rzp.on('payment.failed', function () {
                console.log('payment.failed');
                const addressID = userInfo.map((val) => val._id);
                let deliveryCharge = document.getElementById('deliveryCharge').innerText;
                axios.post('/checkOut?task=RazorPay-Failed', {
                    amount: totalAmt,
                    AppliedCode,
                    ProductData: product,
                    paymentMethod: 'Online Payment',
                    addressID,
                    couponDiscount,
                    deliveryCharge
                })
                    .then(function (response) {
                        // Handle success response if needed
                        if(response){
                            window.location.href ='/profileMenu?menu=myOrders&success=false'
                        }
                    })
                    .catch(function (error) {
                        console.error('Error during checkout (failed payment):', error);
                        // Handle error if needed
                    });
            });

        })
        .catch(function (error) {
            console.error('Error creating payment:', error);
            // Handle error if needed
        });
}


function verifyPayment(payment, order) {
    axios.post('/verify-Payment', { payment, order })
        .then(function (response) { })
        .catch(function (err) { })
}

function messageBox() {
    Swal.fire({
        icon: 'info',
        title: '<span style="font-size:9pt;color: red">Please ensure to provide your current address for accurate delivery.</span>',
        timer: 4000, // Duration in milliseconds
        toast: true,
        position: 'top', // Toast position
        showConfirmButton: false
    });

}

if (Selectpayment.checked) {
    Selectpayment.value = 'Cash On Delivery'
}

function CancelOrder() {
    let blur = document.getElementById('blur');
    blur.classList.remove('active');

    let popup = document.getElementById('SuccessDiv');
    popup.classList.remove('active');
}
const wallet = document.getElementById('wallet')

function ConfirmOrder(ProductData, userAddress) {
    let fetchAddress = JSON.parse(userAddress)
    let total = document.getElementById('toTalAmount').innerText;
    const addressID = fetchAddress.map((val) => val._id)
    console.log(addressID, 'addressID')
    let deliveryCharge = document.getElementById('deliveryCharge').innerText;
    const paymentMethod = document.getElementById('Selectpayment').value
    if (wallet.checked) {
        console.log('sasi')
        axios.post('/checkOut?task=walletPayment', { ProductData, paymentMethod: paymentMethod, addressID: addressID, total, deliveryCharge }) // Sending productID as data
            .then(function (response) {
                // Handle success response if needed
            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });
    } else {
        const totalAmt = document.getElementById('toTalAmount').innerText
        axios.post('/checkOut?task=saveOrderDetails', { amount: totalAmt, couponDiscount, ProductData: ProductData, paymentMethod: paymentMethod, addressID: addressID, deliveryCharge }) // Sending productID as data
            .then(function (response) {
                // Handle success response if needed
            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });
    }


    confirmation.style.display = 'none'
    SuccessRow.style.display = 'block'
    SuccessRow.style.display = 'flex'


}

document.getElementById('onlinePayment').addEventListener('click', function () {
    document.getElementById('COD').style.display = 'none'
    document.getElementById('onlinePaymentBTN').style.display = 'block'
    document.getElementById('onlinePaymentBTN').style.display = 'flex'
})

document.getElementById('Selectpayment').addEventListener('click', function () {
    document.getElementById('COD').style.display = 'block'
    document.getElementById('COD').style.display = 'flex'
    document.getElementById('onlinePaymentBTN').style.display = 'none'
})
document.getElementById('wallet').addEventListener('click', function () {
    document.getElementById('COD').style.display = 'block'
    document.getElementById('COD').style.display = 'flex'
    document.getElementById('onlinePaymentBTN').style.display = 'none'
})



// document.getElementById('wallet').addEventListener('change', function () {

// })

document.getElementById('btnOkey').addEventListener('click', function () {
    let blur = document.getElementById('blur');
    blur.classList.remove('active');

    let popup = document.getElementById('SuccessDiv');
    popup.classList.remove('active');
    wallet.checked = false

    location.href('/checkOut')
})
localStorage.setItem('walletAmt', 0);
document.getElementById('walletAmount').innerHTML = localStorage.getItem('walletAmt');


function successMessage(val) {

    if (Selectpayment.checked && Selectpayment.value === 'Cash On Delivery') {

        let flag = false;
        // axios.get('/checkOut?task=checkValidOrder',{cartDetails})
        // .then(function(response){})
        // .catch(function(error){})
        let cartDetails = JSON.parse(val)
        cartDetails.forEach((val) => {

            if (val.totalPrice > 1000) {
                Swal.fire({
                    icon: 'info',
                    title: '<span style="font-size:9pt;color: red">Order amount is more than 1000 , please choose another payment method</span>',
                    timer: 4000, // Duration in milliseconds
                    toast: true,
                    position: 'top', // Toast position
                    showConfirmButton: false
                });
            } else {
                console.log('i am here....')
                flag = true
            }

        })

        if (flag) {
            let blur = document.getElementById('blur');
            blur.classList.toggle('active');

            let popup = document.getElementById('SuccessDiv');
            popup.classList.toggle('active');
        }



    } else if (wallet.checked && wallet.value === 'Wallet') {
        axios.get('/checkOut?task=checkWallet') // Sending productID as data
            .then(function (response) {

                console.log('response', response)
                // console.log('response', response.data.balance)
                let totalAmount = document.getElementById('toTalAmount').innerText
                if (response.data !== null) {
                    console.log('in', response.data.balance, totalAmount)
                    if (response.data.balance >= totalAmount) {
                        console.log('iinn')
                        let blur = document.getElementById('blur');
                        blur.classList.toggle('active');

                        let popup = document.getElementById('SuccessDiv');
                        popup.classList.toggle('active');

                    } else {
                        location.href = '#open-modal'
                        let amount = response.data.balance !== undefined ? response.data.balance : 0;
                        localStorage.removeItem('walletAmt');
                        // Set new data associated with the same key
                        localStorage.setItem('walletAmt', amount);
                        document.getElementById('walletAmount').innerHTML = localStorage.getItem('walletAmt')
                        let balanceAmount = parseFloat(document.getElementById('toTalAmount').innerText) - parseFloat(amount)
                        localStorage.removeItem('balanceAmt');
                        localStorage.setItem('balanceAmt', balanceAmount)
                        document.getElementById('AddAmount').value = localStorage.getItem('balanceAmt');
                    }
                } else {
                    location.href = '#open-modal'
                    console.log('response.data :', response.data)
                    let amount = response.data !== null ? response.data.balance : 0;
                    localStorage.removeItem('walletAmt');
                    // Set new data associated with the same key
                    localStorage.setItem('walletAmt', amount);
                    document.getElementById('walletAmount').innerHTML = localStorage.getItem('walletAmt')
                    let balanceAmount = parseFloat(document.getElementById('toTalAmount').innerText) - parseFloat(amount)
                    console.log('balanceAmount', balanceAmount)
                    localStorage.removeItem('balanceAmt');
                    localStorage.setItem('balanceAmt', balanceAmount)
                    document.getElementById('AddAmount').value = localStorage.getItem('balanceAmt');
                }

            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });

    }
    else {

        Swal.fire({
            icon: 'info',
            title: '<span style="font-size:9pt;color: red">Please Select Your Payment Method!</span>',
            timer: 4000, // Duration in milliseconds
            toast: true,
            position: 'top', // Toast position
            showConfirmButton: false
        });

    }


}

const cartTotal = document.getElementById('cartTotal')
const cartTotal1 = document.getElementById('cartTotal1')
const totalAmount = document.querySelectorAll('.TotalAmount');
const discount = document.querySelectorAll('.discount');
const toTalAmount = document.getElementById('toTalAmount')
let sum = 0;

const Qty = document.querySelectorAll('.Qty')
const dec = document.querySelectorAll('.dec')
for (let i = 0; i < Qty.length; i++) {
    if (Qty[i].value == 1) {
        dec[i].disabled = true
    }
}

function quantityIncDec(index, id, Products, type) {
    console.log('quantityIncDec')
    const showQty = document.getElementById(`showQty${index}`)
    const totalInput = document.getElementById(`totalPrice${index}`)
    const discountAmt = document.getElementById(`discount${index}`)
    let product = JSON.parse(Products)
    console.log('product ', product)
    let productDetails = product.filter((val) => val._id === id)


    let ExactDiscAmt;
    if (type === 'increment') {
        console.log('increment')
        let quantity = parseFloat(showQty.value)

        let addQty = quantity + 1
        console.log(quantity, addQty)
        axios.put('/checkOut?task=incQuantity', { id, type, newQty: addQty })
            .then(function (response) {
                console.log('Product added to cart successfully', response);
                // Handle success response if needed 
                if (response.data === 'finished') {
                    // location.href = '/shoppingcart'
                    document.getElementById(`increment${index}`).disabled = true;
                } else {
                    location.href = '/checkOut'
                }

            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });


    }
    else if (type === 'decrement') {
        let quantity = parseFloat(showQty.value)
        let addQty = quantity - 1

        axios.put('/checkOut?task=incQuantity', { id, type, newQty: addQty })
            .then(function (response) {
                console.log('Product added to cart successfully', response);
                // Handle success response if needed 
                location.href('/checkOut"')
            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });

    }
}



function quantityIncrement(index, id, Products, type) {
    const showQty = document.getElementById(`showQty${index}`)
    const totalInput = document.getElementById(`totalPrice${index}`)
    const discountAmt = document.getElementById(`discount${index}`)
    let ExactDiscAmt;
    if (type === 'increment') {
        let quantity = parseFloat(showQty.value)
        showQty.value = quantity + 1
        let addQty = parseFloat(showQty.value)
        console.log(addQty)
        axios.patch('/shoppingcart', { newQty: addQty, id }) // Sending productID as data
            .then(function (response) {
                console.log('Product added to cart successfully', response);
                // Handle success response if needed 
                // location.href('/checkOut"')
            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });
    }
    else if (type === 'decrement') {
        if (showQty.value == 2) {
            document.getElementById(`decrement${index}`).disabled = true;
        }
        let quantity = parseFloat(showQty.value)
        showQty.value = quantity - 1
        let addQty = parseFloat(showQty.value)
        // totalInput.value = price*addQty

        axios.patch('/shoppingcart', { newQty: addQty, id }) // Sending productID as data
            .then(function (response) {
                console.log('Product added to cart successfully', response);
                // Handle success response if needed
            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });
    }
}


function selectDeliveryAddress(addressID) {
    axios.put('/checkOut?task=selectDeleveryAddress', { addressID: addressID }) // Sending productID as data
        .then(function (response) {
            // Handle success response if needed

        })
        .catch(function (error) {
            console.error('Error adding product to cart:', error);
            // Handle error if needed
        });
}




function removeProducts(id) {
    axios.post('/checkOut?task=removeProducts', { id: id }) // Sending productID as data
        .then(function (response) {
            // Handle success response if needed
        })
        .catch(function (error) {
            console.error('Error adding product to cart:', error);
            // Handle error if needed
        });
}


const conF2 = document.getElementById('OrderBox')
const conF1 = document.getElementById('addressBox')
document.getElementById('changeBtn').addEventListener('click', function () {
    console.log('i am heree....')
    conF2.style.display = 'none'
    conF1.style.display = 'block'
})


function updateAddress(index, id) {
    const updateBtn = document.querySelector(`.update[data-index="${index}"]`);
    const removeBtn = document.querySelector(`.remove[data-index="${index}"]`);
    const cancelBtn = document.querySelector(`.cancelBtn[data-index="${index}"]`);
    console.log(cancelBtn);
    const form = document.getElementById(`form_${index}`);
    form.style.display = 'block'; // Show the corresponding form
    updateBtn.style.display = 'none'
    removeBtn.style.display = 'none'
    cancelBtn.style.display = 'block'
}
function cancelUpdate(index) {
    const updateBtn = document.querySelector(`.update[data-index="${index}"]`);
    const removeBtn = document.querySelector(`.remove[data-index="${index}"]`);
    const cancelBtn = document.querySelector(`.cancelBtn[data-index="${index}"]`);
    console.log(cancelBtn);
    const form = document.getElementById(`form_${index}`);
    form.style.display = 'none'; // Show the corresponding form
    updateBtn.style.display = 'block'
    removeBtn.style.display = 'block'
    cancelBtn.style.display = 'none'
}

document.getElementById('addAddressDiv').addEventListener('click', function () {
    document.getElementById('addAddressDiv').style.display = 'none'
    document.getElementById('addAddress').style.display = 'block'
    document.getElementById('addAddressCancel').style.display = 'block'
})

document.getElementById('addAddressCancel').addEventListener('click', function () {
    document.getElementById('addAddress').style.display = 'none'
    document.getElementById('addAddressDiv').style.display = 'block'
    document.getElementById('addAddressDiv').style.display = 'flex'
})