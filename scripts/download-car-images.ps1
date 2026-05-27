# Downloads AI-generated car images from Pollinations.ai to assets/cars/
# Run from project root: powershell -ExecutionPolicy Bypass -File scripts/download-car-images.ps1

$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Web

$outDir = Join-Path $PSScriptRoot '..\assets\cars'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

# Each entry: id|seed|prompt
$cars = @(
    'vw-golv|101|compact silver hatchback car, modern european design',
    'renolt-logon|102|budget white sedan car, simple economy car',
    'alfo-tonnle|103|compact red italian crossover SUV',
    'toyoda-corla|104|silver japanese compact sedan, reliable family car',
    'hondo-civica|105|blue compact japanese sedan, sporty hatchback',
    'nezzan-altimo|106|grey japanese mid-size sedan, sporty family car',
    'masda-3sx|107|red japanese compact hatchback, modern design',
    'hyandai-elontra|108|blue korean compact sedan, modern design',
    'chevrolat-cruzo|109|white american compact sedan, family economy car',
    'forde-fucos|110|silver american compact hatchback, sporty design',
    'auddi-a6|201|silver german luxury executive sedan',
    'tkm-xbov|202|black luxury sports sedan, aggressive design',
    'alfo-julia|203|red italian luxury sport sedan',
    'dmw-m8|204|black german grand coupe luxury sports car',
    'lezus-450|205|silver japanese luxury sedan, refined design',
    'genetic-c90|206|white luxury sedan, korean premium car',
    'mercedes-gls|207|black german luxury full-size SUV',
    'porshe-cayman|208|yellow german mid-engine sports coupe',
    'jaguar-xfr|209|british luxury sport sedan, elegant design',
    'volvio-s90|210|swedish luxury executive sedan, scandinavian design',
    'ferarry-v60|301|red italian supercar, exotic sports car',
    'mercedes-exo|302|silver german hypercar, exotic supercar',
    'macleran-b1|303|orange british supercar, mid-engine exotic',
    'lambrogini-uros|304|yellow italian luxury supercar SUV',
    'lambrogini-huri|305|green italian supercar, V10 mid-engine exotic',
    'bugatii-chrion|306|blue and black french hypercar, ultra exclusive',
    'aston-vantash|307|british grey grand tourer luxury sports car',
    'koenig-jetska|308|swedish hypercar, lightweight track-focused exotic',
    'ferarry-jet|401|luxury speedboat tender, red and white sport boat',
    'lezus-marine|402|white luxury cabin cruiser boat',
    'dmw-cruiser|403|white motor yacht cruiser boat',
    'hondo-mariner|404|white luxury speedboat, sporty marine craft',
    'boieng-7s|501|white private business jet airplane',
    'arrbus-exec|502|executive corporate jet airplane',
    'cessna-sky|503|small white private propeller airplane',
    'ferarry-yacht|504|large luxury white superyacht megayacht',
    'mbych-yacht|505|white luxury motor yacht with sleek design'
)

$total = $cars.Count
$index = 0

foreach ($entry in $cars) {
    $index++
    $parts = $entry -split '\|'
    $id = $parts[0]
    $seed = $parts[1]
    $prompt = $parts[2]
    $file = Join-Path $outDir ($id + '.png')

    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        if ($size -gt 5000) {
            Write-Host ("[{0}/{1}] {2} -- skipping (already exists, {3} KB)" -f $index, $total, $id, [math]::Round($size/1024))
            continue
        }
    }

    $fullPrompt = $prompt + ', front three-quarter view, slightly angled facing camera, white background, photorealistic product shot, no text, no people, no logos'
    $encoded = [System.Web.HttpUtility]::UrlEncode($fullPrompt)
    $amp = [char]38
    $qs = 'width=600' + $amp + 'height=400' + $amp + 'nologo=true' + $amp + 'seed=' + $seed
    $url = 'https://image.pollinations.ai/prompt/' + $encoded + '?' + $qs

    Write-Host ("[{0}/{1}] {2} -- generating..." -f $index, $total, $id)

    try {
        Invoke-WebRequest -Uri $url -OutFile $file -TimeoutSec 120 -UseBasicParsing
        $size = (Get-Item $file).Length
        Write-Host ("  -> Saved: {0} ({1} KB)" -f $file, [math]::Round($size/1024))
    } catch {
        Write-Host ("  -> FAILED: " + $_.Exception.Message) -ForegroundColor Red
    }
}

Write-Host ""
Write-Host ("Done! Review images in: " + $outDir)
