<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Uploaded Images</title>
</head>
<body>
    <h2>Uploaded Images</h2>
    <div class="images">
        @foreach ($images as $image)
            <div class="image">
                {{-- Assuming you have a way to access images publicly or a route to serve them --}}
                <img src="{{ Storage::url($image->path) }}" alt="Uploaded Image" style="width: 100px; height: auto;">
                <p>Order: {{ $image->order }}</p>
            </div>
        @endforeach
    </div>
</body>
</html>
