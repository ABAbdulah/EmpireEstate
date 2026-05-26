# Generates Play Store feature graphic options (1024x500)
# Saves to assets/feature-graphics/
$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Web

$outDir = Join-Path $PSScriptRoot '..\assets\feature-graphics'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$graphics = @(
    'banner-tycoon-empire|9001|cartoon style wealthy tycoon character in tuxedo standing in front of luxury mansion with red ferrari supercar, golden city skyline behind, golden hour, wide cinematic banner composition, vibrant colors, mobile game marketing art',
    'banner-empire-rise|9002|cartoon cityscape showing transformation from small lemonade stand on left to towering skyscrapers and mansions on right, ascending arrow path, gold coins floating, wide banner, mobile game key art',
    'banner-money-rain|9003|cartoon tuxedo businessman with sunglasses surrounded by raining gold coins and dollar bills, ferrari and lamborghini cars beside him, luxury mansion background, wide banner, mobile game key art',
    'banner-luxury-fleet|9004|cartoon collection of luxury vehicles: red ferrari, orange lamborghini, silver rolls royce, private jet, white superyacht, lined up in front of skyscrapers, wide marketing banner, mobile game art',
    'banner-tycoon-arms-open|9005|cartoon young tycoon in tuxedo with arms spread wide, his entire empire visible behind him - mansion, supercars, oil rigs, jets, skyscrapers, wide cinematic banner, vibrant mobile game art'
)

$total = $graphics.Count
$index = 0

foreach ($entry in $graphics) {
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
    $qs = 'width=1024' + $amp + 'height=500' + $amp + 'nologo=true' + $amp + 'seed=' + $seed
    $url = 'https://image.pollinations.ai/prompt/' + $encoded + '?' + $qs

    Write-Host ("[{0}/{1}] {2} -- generating 1024x500..." -f $index, $total, $id)

    try {
        Invoke-WebRequest -Uri $url -OutFile $file -TimeoutSec 180 -UseBasicParsing
        $size = (Get-Item $file).Length
        Write-Host ("  -> Saved: {0} ({1} KB)" -f $file, [math]::Round($size/1024))
    } catch {
        Write-Host ("  -> FAILED: " + $_.Exception.Message) -ForegroundColor Red
    }
}

Write-Host ""
Write-Host ("Done! Review in: " + $outDir)
