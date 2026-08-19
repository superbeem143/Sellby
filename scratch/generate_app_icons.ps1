Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\user\.gemini\antigravity-ide\brain\7956f5e1-948b-43f6-b5fe-1258ae85d60b\.user_uploaded\media_1787127447154.jpg"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found at $srcPath"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Source image loaded: $($srcImage.Width) x $($srcImage.Height)"

function Resize-And-Save {
    param (
        [string]$DestinationPath,
        [int]$Width,
        [int]$Height
    )

    $parentDir = Split-Path -Path $DestinationPath -Parent
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $g.DrawImage($srcImage, 0, 0, $Width, $Height)
    $g.Dispose()

    $bmp.Save($DestinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    Write-Host "Generated: $DestinationPath ($Width x $Height)"
}

$baseDir = "c:\Users\user\StudioProjects\sellby"

# 1. Main Web / Logo Files
Resize-And-Save -DestinationPath "$baseDir\images\sellby-logo.png" -Width 512 -Height 512
Resize-And-Save -DestinationPath "$baseDir\www\images\sellby-logo.png" -Width 512 -Height 512
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\assets\public\images\sellby-logo.png" -Width 512 -Height 512

if (Test-Path "$baseDir\ios\App\App\public\images") {
    Resize-And-Save -DestinationPath "$baseDir\ios\App\App\public\images\sellby-logo.png" -Width 512 -Height 512
}

# 2. PWA Manifest / Icon Assets
Resize-And-Save -DestinationPath "$baseDir\icons\icon-192.png" -Width 192 -Height 192
Resize-And-Save -DestinationPath "$baseDir\www\icons\icon-192.png" -Width 192 -Height 192

Resize-And-Save -DestinationPath "$baseDir\icons\icon-512.png" -Width 512 -Height 512
Resize-And-Save -DestinationPath "$baseDir\www\icons\icon-512.png" -Width 512 -Height 512

Resize-And-Save -DestinationPath "$baseDir\icons\post-192.png" -Width 192 -Height 192
Resize-And-Save -DestinationPath "$baseDir\www\icons\post-192.png" -Width 192 -Height 192

Resize-And-Save -DestinationPath "$baseDir\icons\search-192.png" -Width 192 -Height 192
Resize-And-Save -DestinationPath "$baseDir\www\icons\search-192.png" -Width 192 -Height 192

Resize-And-Save -DestinationPath "$baseDir\favicon.ico" -Width 64 -Height 64
Resize-And-Save -DestinationPath "$baseDir\www\favicon.ico" -Width 64 -Height 64

# 3. Android Mipmap Launcher Icons
# mdpi
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-mdpi\ic_launcher.png" -Width 48 -Height 48
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png" -Width 48 -Height 48
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-mdpi\ic_launcher_foreground.png" -Width 108 -Height 108

# hdpi
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-hdpi\ic_launcher.png" -Width 72 -Height 72
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png" -Width 72 -Height 72
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-hdpi\ic_launcher_foreground.png" -Width 162 -Height 162

# xhdpi
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-xhdpi\ic_launcher.png" -Width 96 -Height 96
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png" -Width 96 -Height 96
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-xhdpi\ic_launcher_foreground.png" -Width 216 -Height 216

# xxhdpi
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png" -Width 144 -Height 144
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png" -Width 144 -Height 144
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-xxhdpi\ic_launcher_foreground.png" -Width 324 -Height 324

# xxxhdpi
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png" -Width 192 -Height 192
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png" -Width 192 -Height 192
Resize-And-Save -DestinationPath "$baseDir\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_foreground.png" -Width 432 -Height 432

# 4. iOS App Icon
if (Test-Path "$baseDir\ios\App\App\Assets.xcassets\AppIcon.appiconset") {
    Resize-And-Save -DestinationPath "$baseDir\ios\App\App\Assets.xcassets\AppIcon.appiconset\AppIcon-512@2x.png" -Width 1024 -Height 1024
}

$srcImage.Dispose()
Write-Host "All application icon files successfully generated!"
