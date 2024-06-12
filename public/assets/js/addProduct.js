function validateImageFile() {
    var input = document.getElementById("input-file3");
    var file = input.files[0];

    if (file) {
        var fileType = file.type.split("/")[0]; // Get the file type (e.g., "image" for image files)
        if (fileType !== "image") {
            alert("Please select a valid image file.");
            input.value = ""; // Clear the file input
        }
    }
}


document.getElementById('addProductsForm').addEventListener('submit', function(event) {
    const formControl = document.querySelectorAll('.form-control') 
    let inputs;
    formControl.forEach((val) => {
        inputs = val.value;
        if (inputs.trim() === '' || /\s/.test(inputs)) {
            event.preventDefault(); // Prevent form submission
            Swal.fire({
                icon: 'info',
                title: '<span style="color: red">Please ensure that to Enter Correct Details!</span>',
                timer: 4000, // Duration in milliseconds
                toast: true,
                position: 'top', // Toast position
                showConfirmButton: false
            });
        }
    })
    
});

// function SaveProducts() {
//     console.log('hi bro iam in button')
//     let croppedImages = document.querySelectorAll('.croppedImages')
//     let imageData = [];
//     for (let i = 0; i < croppedImages.length; i++) {
//         imageData.push(croppedImages[i].src)
//     }
//     // let Images = Array.from(croppedImages).map((val) => val.src);
//     console.log('hello bro', imageData)

//     // console.log(imageData)

//     // Send data to the backend using Fetch API
//     axios.post('/adminLogin/ProductList/addProducts',{ imageData })
//         .then(response => {
//             if (response.ok) {
//                 console.log('Images uploaded successfully');
//             } else {
//                 console.error('Image upload failed');
//             }
//         })
//         .catch(error => {
//             console.error('Error uploading images:', error);
//         });
// }


// function handleImageInput(inputId, previewId) {
//     const input = document.getElementById(inputId);
//     const preview = document.getElementById(previewId);

//     input.addEventListener('change', function () {
//         const file = input.files[0];

//         if (file) {
//             const reader = new FileReader();

//             reader.onload = function (e) {
//                 // Set the background image of the preview div
//                 preview.style.backgroundImage = `url(${e.target.result})`;
//                 preview.textContent = "";
//                 preview.style.border = 0
//             };

//             reader.readAsDataURL(file);
//         } else {
//             // Clear the background image if no file is selected
//             preview.style.backgroundImage = 'none';
//         }
//     });
// }

// // Call the function for each image input dynamically
// for (let i = 1; i <= 4; i++) {
//     handleImageInput(`input-file${i}`, `img-view${i}`);
// }

