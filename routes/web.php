<?php
use App\Http\Controllers\ImageUploadController;

use Illuminate\Support\Facades\Route;

Route::get('/', [ImageUploadController::class, 'index']);
Route::post('/upload', [ImageUploadController::class, 'upload']);

