<?php
use App\Http\Controllers\ImageUploadController;

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});


Route::post('/upload', [ImageUploadController::class, 'upload']);
Route::get('/images/show', [ImageUploadController::class, 'showImages']);
