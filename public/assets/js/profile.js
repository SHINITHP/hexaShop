const changeIcon = document.getElementById('changeIcon');
const dropDownLi1 = document.getElementById('DropDownLi1');
const dropDownLi2 = document.getElementById('DropDownLi2');
let isDropDownVisible = false;
let url = '/Profile?task=changeinfo&_method=PATCH'

function checkValidOTP() {
    const NewOTP = document.getElementById('NewOTP').value
    const newEmail = document.getElementById('otpLabel').innerText;
    if (NewOTP.trim() === '' || /\s/.test(NewOTP)) {
        Swal.fire({
            icon: 'info',
            title: '<span style="color: red">Please ensure that to Enter Correct OTP!</span>',
            timer: 4000, // Duration in milliseconds
            toast: true,
            position: 'top', // Toast position
            showConfirmButton: false
        });
    } else {
        console.log('iam in axios')
        axios.patch('/Profile?task=checkEmailotp', { NewOTP, newEmail }) // Sending productID as data
            .then(function (response) {
                console.log('Product added to cart successfully', response);
                if(response.data.message ==='success'){
                    window.location.href = '/Profile'

                    Swal.fire({
                        icon: 'success',
                        text: 'Email Successfully Changed',
                        timer: 4000, // Duration in milliseconds
                        toast: true,
                        position: 'top', // Toast position
                        showConfirmButton: false // Hide confirmation button
                    });
                }else if(response.data.message ==='error'){
                    Swal.fire({
                        icon: 'info',
                        title: '<span style="color: red">Please ensure that, Enter Correct OTP!</span>',
                        timer: 4000, // Duration in milliseconds
                        toast: true,
                        position: 'top', // Toast position
                        showConfirmButton: false
                    });
                }
              
            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });

    }
}

function changePassword(){
    const oldPassword = document.getElementById('oldpassword').value
    const newPassword = document.getElementById('newPassword').value

    if (oldPassword.trim() === '' || /\s/.test(oldPassword) || newPassword.trim() === '' || /\s/.test(newPassword)) {
        Swal.fire({
            icon: 'info',
            title: '<span style="color: red"> Please ensure that the entered data is correct!</span>',
            timer: 4000, // Duration in milliseconds
            toast: true,
            position: 'top', // Toast position
            showConfirmButton: false
        });
    }else {
        axios.patch('/Profile?task=changePassword', { newPassword , oldPassword}) // Sending productID as data
            .then(function (response) {
                console.log('Product added to cart successfully', response);
                if (response.data.message === 'error') {
                    Swal.fire({
                        icon: 'info',
                        title: '<span style="color: red"> Please ensure that the old password you entered is accurate.!</span>',
                        timer: 4000, // Duration in milliseconds
                        toast: true,
                        position: 'top', // Toast position
                        showConfirmButton: false
                    });
                } else if(response.data.message === 'Success'){
                    Swal.fire({
                        icon: 'success',
                        text: 'Password successfully changed',
                        timer: 4000, // Duration in milliseconds
                        toast: true,
                        position: 'top', // Toast position
                        showConfirmButton: false // Hide confirmation button
                    });
                    document.getElementById('oldpassword').value=''
                    document.getElementById('newPassword').value=''
                }else{
                    Swal.fire({
                        icon: 'info',
                        title: '<span style="color: red"> Something Went Wrong!</span>',
                        timer: 4000, // Duration in milliseconds
                        toast: true,
                        position: 'top', // Toast position
                        showConfirmButton: false
                    });
                }
            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });


    }

}

function changeEmail(oldEmail) {
    const newEmailAddress = document.getElementById('newEmailAddress').value
    if (newEmailAddress.trim() === '' || /\s/.test(newEmailAddress)) {
        Swal.fire({
            icon: 'info',
            title: '<span style="color: red"> Please ensure that the entered data is correct!</span>',
            timer: 4000, // Duration in milliseconds
            toast: true,
            position: 'top', // Toast position
            showConfirmButton: false
        });
    } else {
        axios.post('/Profile', { newEmailAddress }) // Sending productID as data
            .then(function (response) {
                console.log('Product added to cart successfully', response);
                if (response.data.message === 'SameEmail') {
                    document.getElementById('emailError').innerHTML = 'New email is same as existing email'
                }else if(response.data.message === 'AlreadyExist'){
                    Swal.fire({
                        icon: 'info',
                        title: '<span style="color: red">Entered email is already exist!</span>',
                        timer: 4000, // Duration in milliseconds
                        toast: true,
                        position: 'top', // Toast position
                        showConfirmButton: false
                    });
                }else {
                    localStorage.removeItem('newEmailAddress');
                    localStorage.setItem('newEmailAddress', oldEmail);
                    const newEmail = localStorage.getItem('newEmailAddress');
                    document.getElementById('otpLabel').innerHTML = newEmail
                    location.href = '#open-modal'
                }
            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });


    }

}


document.getElementById('savebtn').addEventListener('click', function (event) {
    let inputs = document.querySelectorAll('.firstNameInput');
    let isValid = true;

    for (var i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        // Check if input value is not undefined and not null, and if it has whitespace
        if (!input.value || input.value.trim() === '' || /\s/.test(input.value)) {
            isValid = false;
            break; // Exit the loop if any field is invalid
        }
    }

    if (!isValid) {
        console.log('input :', inputs)
        event.preventDefault(); // Prevent form submission
        Swal.fire({
            icon: 'info',
            title: '<span style="color: red">Please ensure that all your information are correct!</span>',
            timer: 4000, // Duration in milliseconds
            toast: true,
            position: 'top', // Toast position
            showConfirmButton: false
        });
    } else {
        console.log('hlo bro ')
        // If all inputs are valid, submit the form
        document.getElementById('updateForm').method = 'Post';
        document.getElementById('updateForm').action = url;
        document.getElementById('savebtn').type = 'submit';
    }
});






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

const imgInput = document.getElementById('imgInput')
const profilePic = document.getElementById('profilePic')
imgInput.addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            profilePic.src = e.target.result;
        }

        reader.readAsDataURL(file);
    }
});


function cropImage(id, divId) {
    let croppers = {};
    document.getElementById(id).addEventListener('change', function (event) {
        let blur = document.getElementById('blur');
        blur.classList.toggle('active');

        let popup = document.getElementById('popup');
        popup.classList.toggle('active');

        let image = document.getElementById('image');
        let cropBtn = document.getElementById('cropBtn');
        // let ReturnImg = document.getElementById(returnImg);

        let files = event.target.files;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = function (e) {
                // Create a new image element for each file
                const newImage = new Image();
                newImage.src = e.target.result;
                image.src = newImage.src

                newImage.onload = function () {
                    // Destroy previous Cropper instance for this image, if exists

                    console.log("Image loaded successfully.");
                    const cropper = new Cropper(image, {
                        aspectRatio: 0, // Set the aspect ratio as needed
                        viewMode: 3,
                        preview: '.preview' // Specify a preview container if needed
                    });

                    // Store the Cropper instance for this image
                    croppers[newImage.src] = cropper;


                    console.log("Cropper initialized:", croppers);

                    cropBtn.addEventListener('click', function () {

                        const croppedImageView = document.getElementById(divId);
                        const croppedCanvas = croppers[newImage.src].getCroppedCanvas();

                        croppedCanvas.toBlob(function (blob) {
                            const blobUrl = URL.createObjectURL(blob);
                            croppedImageView.src = blobUrl;
                            // console.log(croppedImageView.src)
                            // After cropping the image, send the Blob URL to the server

                            croppers[newImage.src].destroy();

                            // Remove 'active' class from blur and popup
                            blur.classList.remove('active');
                            popup.classList.remove('active');
                        }, 'image/jpeg', 0.8)


                    });
                };
                image.src = e.target.result; // Load the image
            };
            reader.readAsDataURL(file);
        }



    });
}

function compressImage(canvas, quality) {
    // Convert canvas to data URL with specified quality
    return canvas.toDataURL('image/jpeg', quality);
}

document.getElementById('edit').addEventListener('click', function (event) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to edit your Information?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('fullName').removeAttribute("readonly");
            document.getElementById('MobileNo').removeAttribute("readonly");
            document.getElementById('emailCancelbtn').style.display='block'
            document.getElementById('passwordCancelbtn').style.display='block'
            const saveBtn = document.getElementById('savebtn')
            document.getElementById('edit').style.display = 'none'
            saveBtn.style.display = 'block'
            document.getElementById('cancelEdit').style.display = 'block'
        } else {
            event.preventDefault();
        }
    });
})

document.getElementById('cancelEdit').addEventListener('click', function () {
    document.getElementById('fullName').readOnly = true;
    document.getElementById('emailCancelbtn').style.display='none'
    document.getElementById('passwordCancelbtn').style.display='none'
    document.getElementById('MobileNo').readOnly = true;
    const saveBtn = document.getElementById('savebtn')
    saveBtn.style.display = 'none'
    document.getElementById('cancelEdit').style.display = 'none'
    document.getElementById('edit').style.display = 'block'
    window.location.href = '/Profile'
})

