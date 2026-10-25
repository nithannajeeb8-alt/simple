$ErrorActionPreference = 'Stop'
$repo = 'https://api.github.com/repos/nithannajeeb8-alt/simple/contents/vowella-homepage/vowella-website/assets?ref=main'
$headers = @{ 'User-Agent' = 'Vowella-Asset-Setup' }
$assetDir = Join-Path $PSScriptRoot 'assets'
New-Item -ItemType Directory -Force -Path $assetDir | Out-Null
Write-Host 'Fetching the original Vowella image assets from the repository...' -ForegroundColor Cyan
$items = Invoke-RestMethod -Uri $repo -Headers $headers
foreach ($item in $items) {
    if ($item.type -ne 'file' -or -not $item.name) { continue }
    $dest = Join-Path $assetDir $item.name
    try {
        Invoke-WebRequest -Uri $item.download_url -OutFile $dest -Headers $headers
        Write-Host ("Downloaded {0}" -f $item.name) -ForegroundColor Green
    } catch {
        Write-Warning ("Could not download {0}: {1}" -f $item.name, $_.Exception.Message)
        throw
    }
}
Write-Host ''
Write-Host 'Asset download complete. index.html, styles.css, script.js and assets are together.' -ForegroundColor Green
