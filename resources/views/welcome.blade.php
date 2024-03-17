<!DOCTYPE html>
<html>
<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Image Upload with Dropzone and jQuery UI Sortable</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/5.7.0/dropzone.min.css" rel="stylesheet">
    <style>
        /* Additional styles to ensure sortable works smoothly */
        .dropzone .dz-preview.dz-image-preview {
            background: #f7f7f7;
            border-radius: 5px;
            padding: 10px;
        }
    </style>
</head>
<body>
<form id="image-upload-form" action="/upload" method="post" enctype="multipart/form-data">
    @csrf
    <div id="image-upload" class="dropzone"></div>
    <button type="button" id="submit-images">SUBMIT</button>
</form>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dropzone/5.7.0/dropzone.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
<script>
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    Dropzone.autoDiscover = false;
    
    $(function() {
        var myDropzone = new Dropzone("#image-upload", {
            url: "/upload",
            autoProcessQueue: false,
            uploadMultiple: true,
            parallelUploads: 100,
            maxFiles: 100,
            addRemoveLinks: true,
            previewsContainer: "#image-upload",
            clickable: "#image-upload"
        });
    
        $("#image-upload").sortable({
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
    
        $('#submit-images').on('click', function(e) {
            e.preventDefault();
            // Manually process the queue after reordering
            myDropzone.processQueue();
        });
        
        myDropzone.on('sending', function(file, xhr, formData) {
            formData.append('_token', $('meta[name="csrf-token"]').attr('content'));
        });

        // Setup additional event handlers as needed (e.g., for successful uploads)
        myDropzone.on("successmultiple", function(files, response) {
            // Handle successful uploads here
            console.log("Success", response);
        });
        
    });
    </script>
    
</body>
</html>
