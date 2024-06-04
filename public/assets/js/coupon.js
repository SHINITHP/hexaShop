let blur = document.getElementById('blur');
let popup = document.getElementById('popup');


function customDateFilter(){
    const startDate = document.getElementById('startDate').value
    const endDate = document.getElementById('endDate').value
    if(startDate && endDate){
        location.href =`/adminLogin/coupon?task=customDate&startDate=${startDate}&endDate=${endDate}`
    }
}

function deleteOffer(id, productID) {
    console.log(id,productID)
    axios.delete('/adminLogin/coupon', { data: { id } })
        .then(function(response) {
            console.log(response);
            // Optionally, redirect to another page after successful deletion
            location.href ='/adminLogin/coupon'
        })
        .catch(function(err) {
            console.log(err);
        });
}

const status = document.querySelectorAll('.status')
for(let i=0;i<status.length;i++){
    if(status[i].innerText === 'Listed'){
        status[i].style.color='green'
    }else{
        status[i].style.color='red'
    }
}

function changeStatus(currStatus,id){
    axios.patch('/adminLogin/coupon?task=changeStatus', {currStatus,id})
        .then(function(response) {
            console.log(response)
            location.href ='/adminLogin/coupon'
        })
        .catch(function(err) {
            console.log(err)
        })
}



async function GenerateCode() {
    try {
        axios.post('/adminLogin/coupon?task=generateCode', {})
        .then(function(response) {
            console.log(response)
            document.getElementById('code').value=response.data.message
        })
        .catch(function(err) {
            console.log(err)
        })
        // Handle response if needed
    } catch (error) {
        console.log(error);
    }
}

function createCoupon(){
    try {
        let code =  document.getElementById('code').value
        let discountAmt = document.getElementById('percentage').value
        let title = document.getElementById('title').value
        let start = document.getElementById('start').value
        let expireOn = document.getElementById('expire').value
        let min = document.getElementById('min').value
        let max = document.getElementById('max').value
        console.log(discountAmt,expireOn,' : expireOn')
        axios.post('/adminLogin/coupon?task=addCoupon', {code,discountAmt,title,start,expireOn,min,max})
        .then(function(response) {
            console.log(response)
            location.href = 'coupon?success=true'
        })
        .catch(function(err) {
            console.log(err)
        })
        // Handle response if needed
    } catch (error) {
        
    }
}

const urlParams = new URLSearchParams(window.location.search);
const success = urlParams.get('success');

if (success === 'true') {
    // Display the success toast
    Swal.fire({
        icon: 'success',
        title: '<span style="color: #5cb85c;font-size:11pt;text-align:center;">Coupon successfully created!</span>',
        timer: 5000,
        toast: true,
        position: 'top',
        showConfirmButton: false
    });
    urlParams.delete('success');
    const newUrl = window.location.pathname + '?' + urlParams.toString(); // Construct new URL
    history.replaceState(null, '', newUrl);
}