function search() {
    const searchBar = document.getElementById('search').value
    var searchLink = document.getElementById("searchLink");
    console.log(searchBar)
    searchLink.href = "/allProducts?task=search&cat=&page=1&text=" + searchBar;
    // Redirect to the new URL
    window.location.href = searchLink.href;
}

document.getElementById('searchBtn').addEventListener('click', function () {
    document.querySelector('.searchBar').style.display = 'block'
    document.querySelector('.searchBar').style.display = 'flex'
    document.querySelector('.main-banner').style.paddingTop = '10px';
})

function shoppingCart(index, productID, Price) {
    let btnShoppingCart = document.getElementById(`shoppingCartBtn${index}`);

    console.log('I am here...');
    axios.post('/', { productID: productID, price: Price }) // Sending productID as data
        .then(function (response) {
            console.log('Product added to cart successfully');
            // Handle success response if needed
        })
        .catch(function (error) {
            console.error('Error adding product to cart:', error);
            // Handle error if needed
        });
}




function Wishlist(element,productID) {

    let i = element.getAttribute('data-index');
    console.log(element)
    let removeIcon = element.querySelector('.remove');
    let add = element.querySelector('.add');
    if (removeIcon.style.display === 'none') {
       

        axios.post('/productOverview?task=wishlist', { productID }) // Sending productID as data
            .then(function (response) {
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

var a = false;
document.addEventListener("DOMContentLoaded", function () {
    let menuTrigger = document.getElementById("menuTrigger");
    let menu = document.getElementById("menuDropDown");
    const menuTriggerSpan = document.querySelector('#menuTrigger span')


    // Toggle menu visibility when the menu trigger is clicked
    menuTrigger.addEventListener("click", function () {
        a = !a;
        menuTrigger.style.display = 'none';
        menuTriggerSpan.style.display = 'none'
        menu.style.display = "block";
        // Hide the menu when clicking outside of it
        if (menu.style.display == "block") {
            document.addEventListener("click", function (event) {
                if (!menu.contains(event.target) && event.target !== menuTrigger) {
                    menu.style.display = "none";
                    menuTrigger.style.display = 'block';
                    menuTriggerSpan.style.display = 'block'
                }
            });
        }
    });

    menu.addEventListener("click", function (event) {
        menu.style.display = "none";
        menuTrigger.style.display = "block";
        menuTriggerSpan.style.display = 'block';
    });
    console.log(a)
});




// $(function () {
//     var selectedClass = "";
//     $("p").click(function () {
//         selectedClass = $(this).attr("data-rel");
//         $("#portfolio").fadeTo(50, 0.1);
//         $("#portfolio div").not("." + selectedClass).fadeOut();
//         setTimeout(function () {
//             $("." + selectedClass).fadeIn();
//             $("#portfolio").fadeTo(50, 1);
//         }, 500);

//     });
// });



