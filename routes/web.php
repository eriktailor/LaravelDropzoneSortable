<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ImageUploadController;

Route::controller(ImageUploadController::class)->group(function () {
    Route::get('/', 'index');
    Route::get('/previews', 'preview');
    Route::post('/upload', 'upload');
});