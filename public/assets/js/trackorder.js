

const changeIcon = document.getElementById('changeIcon');
const dropDownLi1 = document.getElementById('DropDownLi1');
const dropDownLi2 = document.getElementById('DropDownLi2');
let isDropDownVisible = true;

changeIcon.addEventListener('click', function () {
    let icon = document.getElementById('icon');

    if (isDropDownVisible) {
        icon.innerHTML = '&#xf107;'; // Change to the new icon
        dropDownLi1.style.display = 'block';
        dropDownLi2.style.display = 'block';


    } else {
        icon.innerHTML = '&#xf105;'; // Change back to the original icon
        dropDownLi1.style.display = 'none';
        dropDownLi2.style.display = 'none';
    }

    // Toggle the state
    isDropDownVisible = !isDropDownVisible;
});

function cancelOrder() {

    let blur = document.getElementById('blur');
    blur.classList.toggle('active');

    let popup = document.getElementById('SuccessDiv');
    popup.classList.toggle('active');

    let body = document.querySelector('body');

    // Add a class to the body to stop scrolling
    body.classList.add('stop-scrolling');

}

document.getElementById('cancelBtn').addEventListener('click', function () {

    let blur = document.getElementById('blur');
    blur.classList.remove('active');

    let popup = document.getElementById('SuccessDiv');
    popup.classList.remove('active');

    let body = document.querySelector('body');

    // Add a class to the body to stop scrolling
    body.classList.remove('stop-scrolling');

})

function submitRequest(orderID) {

    const reqReason = document.getElementById('canceldropdown').value;
    const optionalReason = document.getElementById('reqReason');
    const data = optionalReason.value


    console.log('document.getElementBy', orderID, reqReason, data)
    let blur = document.getElementById('blur');
    blur.classList.remove('active');

    let popup = document.getElementById('SuccessDiv');
    popup.classList.remove('active');

    let body = document.querySelector('body');

    // Add a class to the body to stop scrolling
    body.classList.remove('stop-scrolling');

    Swal.fire({
        icon: 'success',
        text: 'Request Successfully Sended!',
        timer: 5000, // Duration in milliseconds
        toast: true,
        position: 'top', // Toast position
        showConfirmButton: false // Hide confirmation button
    });

    function send(orderID, reqReason, data) {
        axios.put('/profileMenu?type=cancelRequest', { orderID, reqReason, data }) // Sending productID as data
            .then(function (response) {
                // Handle success response if needed
            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });
    }

    send(orderID, reqReason, data)

}

function returnCancelBtn() {
    let blur = document.getElementById('blur');
    blur.classList.remove('active');

    let popup = document.getElementById('SuccessDiv');
    popup.classList.remove('active');

    let body = document.querySelector('body');

    // Add a class to the body to stop scrolling
    body.classList.remove('stop-scrolling');
}

function btnReturnOrder() {

    let blur = document.getElementById('blur');
    blur.classList.toggle('active');

    let popup = document.getElementById('SuccessDiv');
    popup.classList.toggle('active');

    let body = document.querySelector('body');

    // Add a class to the body to stop scrolling
    body.classList.add('stop-scrolling');

    document.querySelector('.cancel-Confirmation').style.display = 'none'
    document.querySelector('.returnOrder').style.display = 'block'
    document.querySelector('.returnOrder').style.display = 'flex'
}


function returnOrder(orderID) {

    const submitOrder = document.querySelector('.submit-Order')
    SuccessDiv.style.height = '300px'
    document.querySelector('.returnOrder').style.display = 'none'
    submitOrder.style.display = 'block'
    submitOrder.style.display = 'flex'
    let content = 'Your return request is being processed. Expect confirmation shortly';
    document.getElementById('content').innerHTML = content
    const reason = document.getElementById('returndropdown').value
    const optionalreason = document.getElementById('requestReason').value

    console.log(optionalreason)
    axios.put(`/profileMenu?type=returnOrder&id=${orderID}`, { reason, optionalreason }) // Sending productID as data
        .then(function (response) {
            // Handle success response if needed

        })
        .catch(function (error) {
            console.error('Error adding product to cart:', error);
            // Handle error if needed
        });
}

const urlParams = new URLSearchParams(window.location.search);
const success = urlParams.get('success');

if (success === 'true') {
    // Display the success toast
    Swal.fire({
        icon: 'success',
        text: 'Payment successfully paid',
        timer: 5000,
        toast: true,
        position: 'top',
        showConfirmButton: false
    });
    urlParams.delete('success');
    const newUrl = window.location.pathname + '?' + urlParams.toString(); // Construct new URL
    history.replaceState(null, '', newUrl);
}else if(success === 'false'){
    Swal.fire({
        icon: 'info',
        title: '<span style="font-size:9pt;color: red">Please ensure to provide your current address for accurate delivery.</span>',
        timer: 4000, // Duration in milliseconds
        toast: true,
        position: 'top', // Toast position
        showConfirmButton: false
    });
    urlParams.delete('success');
    const newUrl = window.location.pathname + '?' + urlParams.toString(); // Construct new URL
    history.replaceState(null, '', newUrl);
}


function RazorPayment(OrderDetails) {
    let productDetails = JSON.parse(OrderDetails);
    // let userInfo = JSON.parse(user);
    console.log(productDetails);

    // Create an order on the server
    const totalAmt = productDetails[0].Amount
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
                name: productDetails[0].productID.ProductName,
                description: 'Payment for your service',
                order_id: responseData.id,
                handler: function (response) {

                    const addressID = productDetails[0].addressID._id
                    const paymentMethod = 'Online Payment';

                    // Assuming AppliedCode and couponDiscount are defined somewhere in your script
                    axios.post('/checkOut?task=failedPayment', { orderID: productDetails[0]._id })
                        .then(function (response) {
                            // Handle success response if needed
                            location.href = `profileMenu?menu=myOrders&success=true`;
                        })
                        .catch(function (error) {
                            console.error('Error during checkout:', error);
                            // Handle error if needed
                        });
                },
                prefill: {
                    name: productDetails[0].addressID.fullName, // Pre-fill customer's name
                    email: productDetails[0].addressID.emailAddress, // Pre-fill customer's email
                    contact: productDetails[0].addressID.phoneNo // Pre-fill customer's contact number
                },
                theme: {
                    color: '#3399cc' // Customize color
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();
            rzp.on('payment.failed', function (response) {
                // Handle failed payment
                location.href = `profileMenu?menu=myOrders&success=false`;
                //errormessage
            });
        })
        .catch(function (error) {
            console.error('Error creating payment:', error);
            // Handle error if needed
        });
}

