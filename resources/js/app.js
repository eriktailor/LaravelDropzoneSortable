/**
 * ------------------------------------------------------------------------------------
 * PROJECT SETUP
 * ------------------------------------------------------------------------------------
 */

// imports
import './bootstrap.js';
import 'jquery-ui/dist/jquery-ui';
import { Dropzone } from 'dropzone';

// ajax csrf setup
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});

// set global variables
const errorMessage = $('#dzErrorMessage');
const placeHolder = $('#dzPlaceholder');

/**
 * ------------------------------------------------------------------------------------
 * DROPZONE SETUP
 * ------------------------------------------------------------------------------------
 */

Dropzone.autoDiscover = false;

/**
 * Dropzone initial setup
 */
const myDropzone = new Dropzone('#dzDropzone', {
    url: '/upload',
    autoProcessQueue: false,
    uploadMultiple: true,
    parallelUploads: 5,
    maxFiles: 5,
    thumbnailWidth: 800,
    thumbnailHeight: 500,
    previewTemplate: $('#dzImageTemplate').html(),
    previewsContainer: '#dzPreviews',
    acceptedFiles: 'image/*',
});

/**
 * If files dragged into dropzone
 */
myDropzone.on('addedfile', function(file) {

    // hide placeholder and error messages
    errorMessage.hide();
    placeHolder.hide();
    
    // Generate a temporary identifier for each file (data-id)
    file.tempId = 'temp_' + file.name + '_' + file.size + '_' + file.lastModified;
    file.previewElement.setAttribute('data-id', file.tempId);

    // add additional upload areas
    updateAdditionalAreas();
});

/**
 * If dropzone has validation errors
 */
myDropzone.on('error', function(file, response) {
    errorMessage.show().text(response);
    this.removeFile(file);
});

/**
 * On uploading event (attach csrf token)
 */
myDropzone.on('sending', function(file, xhr, formData) {
    formData.append('_token', $('meta[name="csrf-token"]').attr('content'));
});

/**
 * Adjust additional upload areas
 */
function updateAdditionalAreas() {
    let additionalTemplate = $('#dzAdditionalTemplate').html();
    let filesCount = myDropzone.files.length;
    let additionalAreas = 0;

    // remove all additional areas first
    $('.dz-additional-area').remove();

    // count how many additional areas needed
    additionalAreas = 5 - filesCount;

    // render the needed additional areas
    for (let i = 0; i < additionalAreas; i++) {
        $(myDropzone.previewsContainer).append(additionalTemplate);
    }
}

/**
 * If an additional area is clicked
 */
$(document).on('click', '.dz-additional-area', function() {
    if (myDropzone.hiddenFileInput) {

        // open the file browser
        myDropzone.hiddenFileInput.click();
    }
});

/**
 * Remove image function
 */
$(document).on('click', '.dz-remove-button', function(event) {
    event.preventDefault();
    event.stopPropagation();

    // find the corresponding dropzone object
    const filePreview = $(this).closest('.dz-image');
    const tempId = filePreview.data('id');
    const fileToRemove = myDropzone.files.find(function(file) {
        return file.tempId === tempId;
    });

    if (fileToRemove) {

        // remove the file
        myDropzone.removeFile(fileToRemove);

        // delay the execution of the layout adjustment
        setTimeout(() => {

            // if there are no more files, show the upload prompt again
            if (myDropzone.files.length === 0) {

                placeHolder.show();
                $('.dz-additional-area').remove();

            } else { 

                // update the additional areas in case the count needs adjusting
                updateAdditionalAreas(); 
            }
        }, 10);
    }

    // hide error messages
    errorMessage.hide();
});

/**
 * ------------------------------------------------------------------------------------
 * SORTABLE SETUP
 * ------------------------------------------------------------------------------------
 */

/**
 * Sortable initial setup
 */
$('#dzPreviews').sortable({
    items: '.dz-image',
    cursor: 'grab',
    opacity: 0.5,
    containment: 'parent',
    distance: 20,
    tolerance: 'pointer',
    placeholder: 'sortable-placeholder',
    update: function() {

        // after sorting, adjust the layout and move the cover badge to the first item
        $('#dzPreviews .dz-image').each(function(index) {
            if (index === 0) {

                // ensure the first item is cover image
                $(this).removeClass('col-md-6').addClass('col-12');

                // adjust the height for the cover image
                $(this).find('.dz-image').css('height', '350px'); 
                
                // move the cover badge to this item if it's not already here
                if ($(this).find('.dz-cover-badge').length === 0) {

                    // remove any existing cover badge first
                    $('.dz-cover-badge').remove();

                    // add the cover badge to this item
                    const coverBadgeHtml = $('#dzBadgeTemplate').html();
                    $(this).find('.dz-image').append(coverBadgeHtml);
                    
                }
            } else {

                // make following items additional items
                $(this).removeClass('col-12').addClass('col-md-6');

                // reset the height of additional items
                $(this).find('.dz-image').css('height', '200px');
            }
        });
    },
    stop: function() {

        // update the files array based on new order
        const files = myDropzone.files;
        const sortedFiles = [];

        $('#dzPreviews .dz-image').each(function() {

            // find the file unique data-id
            const fileId = $(this).data('id');
            const file = myDropzone.files.find(file => file.tempId === fileId);

            // if file found, push to order array
            if (file) {
                sortedFiles.push(file);
            }
        });

        myDropzone.files = sortedFiles;
    }
});

/**
 * ------------------------------------------------------------------------------------
 * FINAL STEPS
 * ------------------------------------------------------------------------------------
 */

/**
 * On successful upload
 */
myDropzone.on('successmultiple', function(response) {
    const successMessage = $('#dzSuccessMessage').html();

    // hide additional areas & dropzone 
    $('.dz-additional-area').parent().remove();
    $('#dzImageUploadForm').fadeOut(300);

    // show success message
    setTimeout(function() {
        $(successMessage).insertBefore('#dzImageUploadForm').fadeIn();
    }, 300);
});

/**
 * Submit images upload
 */
$('#dzSubmitButton').on('click', function(event) {
    event.preventDefault();

    // show error messages if not have enough images
    if (myDropzone.files.length === 0) {
        errorMessage.show().text('You have to upload at least 1 image.');
    } else {

        // process the queue
        myDropzone.processQueue();
    }
});