/**
 * ------------------------------------------------------------------------------------
 * PROJECT SETUP
 * ------------------------------------------------------------------------------------
 */

// import jQuery
import './bootstrap.js';

// import jQuery UI
import 'jquery-ui/dist/jquery-ui';

// import Dropzone
import { Dropzone } from 'dropzone';

// ajax csrf setup
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});

// prevent dropzone autodiscover
Dropzone.autoDiscover = false;

// set global variables
const errorMessage = $('#dzErrorMessage');
const placeHolder = $('#dzPlaceholder');

/**
 * ------------------------------------------------------------------------------------
 * DROPZONE SETUP
 * ------------------------------------------------------------------------------------
 */

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
    previewTemplate: $('#dzTemplate').html(),
    previewsContainer: '#dzPreviews',
    acceptedFiles: 'image/*',
});

/**
 * If files dragged into dropzone
 */
myDropzone.on('addedfile', function(file) {
    errorMessage.hide();
    placeHolder.hide();
    
    // Generate a temporary identifier for each file
    file.tempId = 'temp_' + file.name + '_' + file.size + '_' + file.lastModified;
    file.previewElement.setAttribute('data-id', file.tempId);
    
    setTimeout(() => {

        // Update layout for existing previews
        const previews = $(myDropzone.previewsContainer).children(':not(.dz-additional-area)');
        previews.addClass('col-md-6');
        if (myDropzone.files.length >= 1) {
            previews.eq(0).removeClass('col-md-6').addClass('col-12');
            $('#dzDropzone').addClass('border-0');
        }

        // Adds the cover badge to first image
        const coverBadge = $('#dzBadgeTemplate').html();
        if (previews.eq(0).find('.dz-cover-badge').length === 0) {
            previews.eq(0).find('.dz-image').append(coverBadge);
        }
        
        updateAdditionalAreas(); 
    }, 0);
});

/**
 * If dropzone has validation errors
 */
myDropzone.on('error', function(file, response) {
    errorMessage.show().text(response);
    this.removeFile(file);

    // if there are no more files in Dropzone, show the placeholder
    if (myDropzone.files.length < 1) {
        placeHolder.show();
    }
});

/**
 * On sending event (attach csrf token)
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
    $('.dz-additional-area').parent().remove();

    additionalAreas = 5 - filesCount;

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

    const filePreview = $(this).closest('.dz-image-preview');
    const fileId = filePreview.data('file-id');

    // find the corresponding Dropzone object
    const fileToRemove = myDropzone.files.find(function(file) {
        return file.uniqueId === fileId;
    });

    if (fileToRemove) {

        // Capture the index of the file to be removed before actually removing it
        let wasCoverImage = filePreview.index() === 0;

        // remove the file
        myDropzone.removeFile(fileToRemove);

        // use setTimeout to delay the execution of the layout adjustment
        setTimeout(() => {

            // check if the removed file was the cover image
            if (wasCoverImage && myDropzone.files.length > 0) {

                setTimeout(() => {
                    const previews = $(myDropzone.previewsContainer).children(':not(.dz-additional-area)');
                    previews.removeClass('col-12 col-md-6').addClass('col-md-6');

                    if (previews.length > 0) {

                        // make the first preview the new cover
                        previews.eq(0).removeClass('col-md-6').addClass('col-12');
                        $('#dzDropzone').addClass('border-0');

                        // ensure the cover badge is correctly placed
                        $('.dz-cover-badge').remove();
                        previews.eq(0).find('.dz-image').append($('#dzBadgeTemplate').html());

                    } else {

                        // if there are no more previews, show the message again
                        placeHolder.show();
                        $('#dzDropzone').removeClass('border-0');
                    }

                    // Update the additional areas in case the count needs adjusting
                    updateAdditionalAreas(); 
                }, 0);
            
            // if there are no more files, show the upload prompt again
            } else if (myDropzone.files.length === 0) {

                placeHolder.show();
                $('#dzDropzone').removeClass('border-0');
                $('.dz-additional-area').parent().remove();

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
    items: '.dz-image-preview',
    cursor: 'grab',
    opacity: 0.5,
    containment: 'parent',
    distance: 20,
    tolerance: 'pointer',
    placeholder: 'sortable-placeholder',
    update: function() {

        // after sorting, adjust the layout and move the cover badge to the first item
        $('#dzPreviews .dz-image-preview').each(function(index) {
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

        $('#dzPreviews .dz-image-preview').each(function() {

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