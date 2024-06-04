
document.getElementById('sortForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the form from submitting the default way

    var sortOrder = document.getElementById('sortSelect').value;
    var actionUrl = '/allProductFilter?page=1';

    if (sortOrder) {
        actionUrl += '&sortOrder=' + encodeURIComponent(sortOrder);
    }

    window.location.href = actionUrl; // Redirect to the new URL
});

let mainCategory = document.querySelectorAll('.collapse');
console.log('mainCategory', mainCategory)
let value ='';

mainCategory.forEach((val, index) => {
    if (val.classList.contains('show')) {
        if (index == 0) {
            value = 'Mens'
        } else if (index == 1) {
            value = 'Womens'
        } else if (index == 2) {
            value = 'Kids'
        }
    }
})



console.log('value ;', value)

document.getElementById('searchBtn').addEventListener('click', function () {
    document.querySelector('.searchBar').style.display = 'block'
    document.querySelector('.searchBar').style.display = 'flex'
    // document.querySelector('.main-banner').style.paddingTop = '10px';
    document.querySelector('.shop').style.marginTop = '0px'
})

function search() {
    
    const searchBar = document.getElementById('search').value
    var searchLink = document.getElementById("searchLink");
    console.log(searchBar)
    searchLink.href = `/allProducts?task=search&cat=${value}&page=1&text=${searchBar}`;
    // Redirect to the new URL
    window.location.href = searchLink.href;
}

function Filter() {
    const minimum = document.getElementById('minimumValue').value
    const maximum = document.getElementById('maximumValue').value
    if (minimum !=='' || maximum !=='') {
        console.log(value)
        if (!value) {
            document.getElementById("FilterForm").action = `allProducts?task=priceFilter&page=1&cat=allProducts`
        } else {
            document.getElementById("FilterForm").action = `allProducts?task=priceFilter&page=1&cat=${value}`
        }
    }else{
        document.getElementById("FilterForm").action =''
    }


}



