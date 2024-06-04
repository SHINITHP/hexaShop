const selectImage = document.getElementById('selectImage').value
function cropImage() {
    let cropper;

    // console.log(selectImage, 'selectImage')
    const input = document.getElementById('selectImage');
    const imageContainer = document.getElementById('imageContainer');
    let image = document.getElementById('image');
    let cropBtn = document.getElementById('cropBtn');
    let SaveBtn = document.getElementById('SaveBtn');
    let blur = document.getElementById('blur');
    let popup = document.getElementById('popup');


    if (input.files && input.files[0]) {

        blur.classList.toggle('active-Blur');
        popup.classList.toggle('active-popup');

        for (let i = 0; i < input.files.length; i++) {
            const reader = new FileReader();
            const imgElement = document.createElement('img');
            imgElement.classList.add(`preview`);
            imgElement.id = `preview${i}`;

            reader.onload = function (e) {
                // e.target.result contains the base64 encoded image data
                const imageData = e.target.result;
                // Set the src attribute of the <img> element to the image data
                imgElement.src = imageData;
            };
            imgElement.onclick = function () {
                saveImage(`preview${i}`);
            };
            // Read the selected file as a Data URL
            reader.readAsDataURL(input.files[i]);
            // Append the <img> element to the image container
            imageContainer.appendChild(imgElement);
        }
    }




    let idName;
    function saveImage(val) {
        if (cropper) {
            cropper.destroy();
        }
        idName = val;
        // console.log('iam heree..', val)
        image.src = ''
        image.src = document.getElementById(val).src
        // console.log('document.getElementById(val).src', document.getElementById(val).src, image.src)
        cropper = new Cropper(image, {
            aspectRatio: 0, // Set the aspect ratio as needed
            viewMode: 3,
        });
        // console.log(cropper,': cropper')

    }



    cropBtn.addEventListener('click', function () {

        // Get cropped canvas
        const canvas = cropper.getCroppedCanvas();

        // Check if there is a cropped canvas
        if (canvas) {
            // Convert canvas to base64 data URL
            const croppedImageDataURL = canvas.toDataURL();
            document.getElementById(idName).src = croppedImageDataURL;
        } else {
            // Handle case where no crop selection is made
            console.error('Could not get cropped canvas');
        }
    });

    SaveBtn.addEventListener('click', function () {
        let imgInput = document.querySelector('.imgInput')
        let preview = document.querySelectorAll('.preview');
        preview.forEach((element, i) => {
            // console.log(element.src, ': element');
            const imgLabel = document.createElement('label');
            imgLabel.classList.add('ml-3');
            imgLabel.id = `drop-area${i + 1}`;
            
            const srcInput  = document.createElement('input')
            srcInput.type='text'
            srcInput.name='imageLinks'
            srcInput.hidden = true;
            srcInput.value = element.src
            imgLabel.appendChild(srcInput)
            // console.log(srcInput.value)
            const imgDiv = document.createElement('img');
            imgDiv.classList.add('croppedImages')
            imgDiv.id = `img-view${i + 1}`;
            imgDiv.src = element.src; // Corrected the URL format

            imgLabel.appendChild(imgDiv); // Appended imgDiv, not imgLabel

            imgInput.appendChild(imgLabel);
        });

        blur.classList.remove('active-Blur');
        popup.classList.remove('active-popup');
        document.querySelector('.ImgRow').style.display = 'block';
        document.querySelector('.ImgRow').style.display = 'flex'



    })



}





// document.getElementById(id).addEventListener('change', function (event) {
//     let blur = document.getElementById('blur');
//     blur.classList.toggle('active');

//     let popup = document.getElementById('popup');
//     popup.classList.toggle('active');

//     let image = document.getElementById('image');
//     let cropBtn = document.getElementById('cropBtn');
//     // let ReturnImg = document.getElementById(returnImg);

//     let files = event.target.files;

//     for (let i = 0; i < files.length; i++) {
//         const file = files[i];
//         const reader = new FileReader();

//         reader.onload = function (e) {
//             // Create a new image element for each file
//             const newImage = new Image();
//             newImage.src = e.target.result;
//             image.src = newImage.src

//             newImage.onload = function () {
//                 // Destroy previous Cropper instance for this image, if exists

//                 console.log("Image loaded successfully.");
//                 const cropper = new Cropper(image, {
//                     aspectRatio: 0, // Set the aspect ratio as needed
//                     viewMode: 3,
//                     preview: '.preview' // Specify a preview container if needed
//                 });

//                 // Store the Cropper instance for this image
//                 croppers[newImage.src] = cropper;


//                 console.log("Cropper initialized:", croppers);

//                 cropBtn.addEventListener('click', function () {

//                     const croppedImageView = document.getElementById(divId);
//                     const croppedCanvas = croppers[newImage.src].getCroppedCanvas();

//                     croppedCanvas.toBlob(function (blob) {
//                         const blobUrl = URL.createObjectURL(blob);
//                         croppedImageView.style.backgroundImage = `url(${blobUrl})`;
//                         // ReturnImg.value = blobUrl;
//                         // console.log('dnsdjfnjdfg :', ReturnImg.value);

//                         croppers[newImage.src].destroy();

//                         // Remove 'active' class from blur and popup
//                         blur.classList.remove('active');
//                         popup.classList.remove('active');
//                     }, 'image/jpeg', 0.8)


//                 });
//             };
//             image.src = e.target.result; // Load the image
//         };
//         reader.readAsDataURL(file);
//     }



// });


// function compressImage(canvas, quality) {
//     // Convert canvas to data URL with specified quality
//     return canvas.toDataURL('image/jpeg', quality);
// }