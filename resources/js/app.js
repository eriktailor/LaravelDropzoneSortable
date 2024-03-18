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
var errorMessage = $('#dzErrorMessage'),
    placeHolder = $('#dzPlaceholder');

/**
 * ------------------------------------------------------------------------------------
 * DROPZONE SETUP
 * ------------------------------------------------------------------------------------
 */

/**
 * Dropzone initial setup
 */
var myDropzone = new Dropzone('#dzDropzone', {
    url: '/upload',
    autoProcessQueue: false,
    uploadMultiple: true,
    parallelUploads: 11,
    maxFiles: 11,
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
        var coverBadge = $('#dzBadgeTemplate').html();
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
    $(myDropzone.previewsContainer).find('.dz-additional-area').parent().remove();

    additionalAreas = 9 - filesCount;

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

    var filePreview = $(this).closest('.dz-image-preview');
    var fileId = filePreview.data('file-id');

    // find the corresponding Dropzone object
    var fileToRemove = myDropzone.files.find(function(file) {
        return file.uniqueId === fileId;
    });

    if (fileToRemove) {

        // Capture the index of the file to be removed before actually removing it
        let wasCoverImage = filePreview.index() === 0;

        // remove the file
        myDropzone.removeFile(fileToRemove);

        // use setTimeout to delay the execution of the layout adjustment
        // this gives Dropzone enough time to update its internal state
        setTimeout(() => {
            if (wasCoverImage && myDropzone.files.length > 0) {

                // the removed file was the cover image and there are still other files left
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

            } else if (myDropzone.files.length === 0) {

                // if there are no more files, possibly show the upload prompt again
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
    items: '.dz-preview',
    cursor: 'move',
    opacity: 0.5,
    containment: '#image-upload',
    distance: 20,
    tolerance: 'pointer',
    stop: function() {
        // Update the files array based on new order
        var files = myDropzone.files;
        var sortedFiles = [];
        $('#image-upload .dz-preview .dz-filename [data-dz-name]').each(function() {
            var name = $(this).text();
            var file = files.find(file => file.name === name);
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
 * Submit images upload
 */
$('#dzSubmitButton').on('click', function(event) {
    event.preventDefault();
    myDropzone.processQueue();
});