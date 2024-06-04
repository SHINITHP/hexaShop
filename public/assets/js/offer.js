let blur = document.getElementById('blur');
let popup = document.getElementById('popup');

const status = document.querySelectorAll('.status')


function deleteOffer(id, productID) {
    console.log(id,productID)
    axios.delete('/adminLogin/offers', { data: { id, productID } })
        .then(function(response) {
            console.log(response);
            // Optionally, redirect to another page after successful deletion
            location.href ='/adminLogin/offers'
        })
        .catch(function(err) {
            console.log(err);
        });
}

function changeStatus(currStatus,id){
    axios.patch('/adminLogin/offers?task=changeStatus', {currStatus,id})
        .then(function(response) {
            console.log(response)
            location.href ='/adminLogin/offers'
        })
        .catch(function(err) {
            console.log(err)
        })
}



for(let i=0;i<status.length;i++){
    if(status[i].innerText === 'Listed'){
        status[i].style.color='green'
    }else{
        status[i].style.color='red'
    }
}


function selectProduct() {
    const Category = document.getElementById('Category').value
    console.log(Category)
    axios.post('/adminLogin/offers?task=selectProduct', { Category })
        .then(function (response) {
            console.log(response)
            if (response) {
                document.getElementById('showProducts').innerHTML=''
                const data = response.data.products;
                data.forEach(element => {
                    const option = document.createElement('option');
                    option.value = element._id;
                    option.innerText = element.ProductName;
                    const selectElement = document.getElementById('showProducts');
                    selectElement.appendChild(option);
                });

            }
        })
        .catch(function (err) {
            console.log(err)
        })
}

function createOffer() {
    console.log('hi')
    let title = document.getElementById('title').value
    let percentage = document.getElementById('percentage').value
    let Category = document.getElementById('Category').value
    let products = document.getElementById('showProducts');
    let selectedValues = [];
    for (let option of products.selectedOptions) {
        selectedValues.push(option.value);
    }

    if (title == '' || percentage == '' || Category == '' || selectedValues == '') {
        console.log('hi')
        document.getElementById('error').innerHTML = 'Please Fill Out The Fields'
    } else {
        axios.post('/adminLogin/offers?task=createOffer', { title, percentage, Category, selectedValues })
            .then(function (response) {
                console.log(response)
                document.getElementById('title').value = ''
                document.getElementById('percentage').value = ''
                document.getElementById('selectCat').selected = true
                document.getElementById('showProducts').value = ''
                const selectElement = document.getElementById('showProducts');

                // Remove all child options
                while (selectElement.firstChild) {
                    selectElement.removeChild(selectElement.firstChild);
                }

                location.href ='/adminLogin/offers'

            })
            .catch(function (err) {
                console.log(err)
            })
    }

}