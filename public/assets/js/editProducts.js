const selectImage = document.getElementById('selectImage').value
let blur = document.getElementById('blur');
let popup = document.getElementById('popup');

// function cancelbtn(){
   
//     imgElements.forEach(img => {
//         img.remove();
//     });

//     imgElements = [];
//     document.getElementById('selectImage').value = ''

//     blur.classList.remove('active');
//     popup.classList.remove('active');
// }
function cropImage() {
    let cropper;

    // console.log(selectImage, 'selectImage')
    const input = document.getElementById('selectImage');
    const imageContainer = document.getElementById('imageContainer');
    let image = document.getElementById('image');
    let cropBtn = document.getElementById('cropBtn');
    let SaveBtn = document.getElementById('SaveBtn');
   

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
                // image.src= document.getElementById('preview0').src
                
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
        let a = image.src
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

            const atag = document.createElement('a');
            atag.classList.add('dltImage')
            atag.onclick = function () {
                removeImage();
            };
            imgLabel.appendChild(atag)

            const itag = document.createElement('i');
            itag.classList.add('fa-solid')
            itag.classList.add('fa-xmark')
            itag.style.color='black';

            atag.appendChild(itag)

            const imgDiv = document.createElement('img');
            imgDiv.classList.add('croppedImages')
            imgDiv.id = `img-view${i + 1}`;
            imgDiv.src = element.src; // Corrected the URL format

            imgLabel.appendChild(imgDiv); // Appended imgDiv, not imgLabel

            imgInput.appendChild(imgLabel);
        });

        blur.classList.remove('active-Blur');
        popup.classList.remove('active-popup');



    })



}


function deleteImage(index, id) {
    axios.delete('/adminLogin/editProducts?task=deleteImage', {
        data: { index, id }
    })
    .then(response => {
        if (response.status === 200) {
            console.log('Image deleted successfully');
            location.href =`/adminLogin/editProducts?id=${id}`
        } else {
            console.error('Failed to delete image');
        }
    })
    .catch(error => {
        console.error('Error deleting image:', error);
    });
}

// function SaveupdatedImgs(id){
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
//     axios.put(`/adminLogin/editProducts?id=${id}`,{ imageData })
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