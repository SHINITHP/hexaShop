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
                            croppedImageView.src =blobUrl;
                            console.log(croppedImageView.src)

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
    const confirmation = confirm('Are you sure to edit your information?');
    if (!confirmation) {
        event.preventDefault(); // Prevent form submission
    } else {
        const saveBtn = document.getElementById('svaebtn')
        saveBtn.style.display = 'block'
    }

})