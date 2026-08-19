Add-Type -AssemblyName System.Drawing

$baseDir = "c:\Users\user\StudioProjects\sellby"

$requiredFiles = @(
    @{ Path = "$baseDir\images\sellby-logo.png"; Width = 512; Height = 512 },
    @{ Path = "$baseDir\www\images\sellby-logo.png"; Width = 512; Height = 512 },
    @{ Path = "$baseDir\android\app\src\main\assets\public\images\sellby-logo.png"; Width = 512; Height = 512 },
    @{ Path = "$baseDir\icons\icon-192.png"; Width = 192; Height = 192 },
    @{ Path = "$baseDir\www\icons\icon-192.png"; Width = 192; Height = 192 },
    @{ Path = "$baseDir\icons\icon-512.png"; Width = 512; Height = 512 },
    @{ Path = "$baseDir\www\icons\icon-512.png"; Width = 512; Height = 512 },
    @{ Path = "$baseDir\icons\post-192.png"; Width = 192; Height = 192 },
    @{ Path = "$baseDir\www\icons\post-192.png"; Width = 192; Height = 192 },
    @{ Path = "$baseDir\icons\search-192.png"; Width = 192; Height = 192 },
    @{ Path = "$baseDir\www\icons\search-192.png"; Width = 192; Height = 192 },
    @{ Path = "$baseDir\favicon.ico"; Width = 64; Height = 64 },
    @{ Path = "$baseDir\www\favicon.ico"; Width = 64; Height = 64 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-mdpi\ic_launcher.png"; Width = 48; Height = 48 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png"; Width = 48; Height = 48 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-mdpi\ic_launcher_foreground.png"; Width = 108; Height = 108 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-hdpi\ic_launcher.png"; Width = 72; Height = 72 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png"; Width = 72; Height = 72 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-hdpi\ic_launcher_foreground.png"; Width = 162; Height = 162 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-xhdpi\ic_launcher.png"; Width = 96; Height = 96 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png"; Width = 96; Height = 96 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-xhdpi\ic_launcher_foreground.png"; Width = 216; Height = 216 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png"; Width = 144; Height = 144 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png"; Width = 144; Height = 144 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-xxhdpi\ic_launcher_foreground.png"; Width = 324; Height = 324 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png"; Width = 192; Height = 192 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png"; Width = 192; Height = 192 },
    @{ Path = "$baseDir\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_foreground.png"; Width = 432; Height = 432 },
    @{ Path = "$baseDir\ios\App\App\Assets.xcassets\AppIcon.appiconset\AppIcon-512@2x.png"; Width = 1024; Height = 1024 }
)

$passedCount = 0
$failedCount = 0

foreach ($item in $requiredFiles) {
    $p = $item.Path
    if (-not (Test-Path $p)) {
        Write-Host "❌ FAIL: File missing -> $p"
        $failedCount++
        continue
    }

    try {
        $img = [System.Drawing.Image]::FromFile($p)
        if ($img.Width -eq $item.Width -and $img.Height -eq $item.Height) {
            Write-Host "✅ PASS: $p ($($img.Width)x$($img.Height))"
            $passedCount++
        } else {
            Write-Host "❌ FAIL: Dimension mismatch -> $p (Expected $($item.Width)x$($item.Height), Got $($img.Width)x$($img.Height))"
            $failedCount++
        }
        $img.Dispose()
    } catch {
        Write-Host "❌ FAIL: Error reading image -> $p"
        $failedCount++
    }
}

Write-Host "`nSummary: $passedCount PASSED, $failedCount FAILED"
if ($failedCount -eq 0) {
    Write-Host "ALL ICON VERIFICATIONS COMPLETED SUCCESSFULLY!"
} else {
    exit 1
}
