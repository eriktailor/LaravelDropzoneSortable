/**
 * PROJECT PREPARATION
 * ------------------------------------------------------------------------------------
 */

// prevent dropzone from autodiscover
Dropzone.autoDiscover = false;

// ajax csrf token setup
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});

/**
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
 * Send csrf token with dropzone
 */
myDropzone.on('sending', function(file, xhr, formData) {
    formData.append('_token', $('meta[name="csrf-token"]').attr('content'));
});

/**
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
 * Submit images upload
 */
$('#dzSubmitButton').on('click', function(event) {
    event.preventDefault();
    myDropzone.processQueue();
});