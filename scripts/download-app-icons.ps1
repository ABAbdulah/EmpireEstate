# Generates app icon options for Empire State — wealthy tycoon theme
# Saves to assets/icon-options/
$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Web

$outDir = Join-Path $PSScriptRoot '..\assets\icon-options'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$icons = @(
    'tycoon-ferrari|8001|wealthy young businessman in black tuxedo standing confidently in front of red ferrari supercar parked in front of luxury white mansion, golden hour lighting, cinematic mobile game app icon, vibrant colors, polished render',
    'tycoon-lambo|8002|rich man in tuxedo with crossed arms standing in front of orange lamborghini and luxury mansion estate, mobile game app icon, glossy 3d render, bold composition, vibrant',
    'tycoon-rolls|8003|elegant gentleman in classic tuxedo with bowtie next to silver rolls royce parked at marble mansion entrance, cinematic mobile game icon, premium luxury vibe, vibrant',
    'tycoon-mansion|8004|young tycoon in black tuxedo holding glass of champagne with red ferrari and giant white mansion behind, golden sky, mobile game app icon style, polished 3d',
    'cartoon-tycoon|8005|cartoon style cute tycoon character in tuxedo with sunglasses standing next to red sports car and big mansion, mobile game app icon, vibrant cel shaded art, fun and playful',
    'tycoon-money|8006|wealthy man in tuxedo throwing money in the air with luxury ferrari and mansion in background, mobile game app icon, glossy render, gold and red palette'
)

$total = $icons.Count
$index = 0

foreach ($entry in $icons) {
    $index++
    $parts = $entry -split '\|'
    $id = $parts[0]
    $seed = $parts[1]
    $prompt = $parts[2]
    $file = Join-Path $outDir ($id + '.png')

    if (Test-Path $file) {
        Write-Host ("[{0}/{1}] {2} -- skipping (exists)" -f $index, $total, $id)
        continue
    }

    $encoded = [System.Web.HttpUtility]::UrlEncode($prompt)
    $amp = [char]38
    $qs = 'width=512' + $amp + 'height=512' + $amp + 'nologo=true' + $amp + 'seed=' + $seed
    $url = 'https://image.pollinations.ai/prompt/' + $encoded + '?' + $qs

    Write-Host ("[{0}/{1}] {2} -- generating 512x512..." -f $index, $total, $id)

    try {
        Invoke-WebRequest -Uri $url -OutFile $file -TimeoutSec 180 -UseBasicParsing
        $size = (Get-Item $file).Length
        Write-Host ("  -> Saved: {0} ({1} KB)" -f $file, [math]::Round($size/1024))
    } catch {
        Write-Host ("  -> FAILED: " + $_.Exception.Message) -ForegroundColor Red
    }
}

Write-Host ""
Write-Host ("Done! Review icons in: " + $outDir)
