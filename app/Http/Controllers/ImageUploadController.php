<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Image;
use Illuminate\Support\Facades\Storage;

class ImageUploadController extends Controller
{
    public function showImages()
    {
        $images = Image::orderBy('order', 'asc')->get();
        return view('show-images', compact('images'));
    }

    public function upload(Request $request)
    {
        $images = $request->file('file');
        foreach ($images as $index => $image) {
            $path = $image->store('public/images', 'local'); // Adjust 'local' if needed
            Image::create([
                'path' => $path,
                'order' => $index + 1,
            ]);
        }

        return response()->json(['success' => true]);
    }
}
