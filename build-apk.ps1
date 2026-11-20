# Builds the signed Sunshine Android APK on Windows.
# Needs: Node.js, JDK 17, and the Android SDK (installed by Android Studio).
# Run from the repo folder:  powershell -ExecutionPolicy Bypass -File .\build-apk.ps1

$ErrorActionPreference = 'Stop'
$repo = $PSScriptRoot
$app  = Join-Path $repo 'app'

function Step($text) { Write-Host "`n==> $text" -ForegroundColor Yellow }
function Fail($text) { Write-Host "`n$text" -ForegroundColor Red; exit 1 }

# --- Check tools -----------------------------------------------------------
Step 'Checking tools'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Fail 'Node.js is missing. Install it with:  winget install OpenJS.NodeJS.LTS   then open a new PowerShell window.' }

# Prefer a JDK 17 (the Android build tools in this project need it).
$jdk = $null
$candidates = @()
$candidates += Get-ChildItem 'C:\Program Files\Eclipse Adoptium' -Directory -Filter 'jdk-17*' -ErrorAction SilentlyContinue
$candidates += Get-ChildItem 'C:\Program Files\Microsoft' -Directory -Filter 'jdk-17*' -ErrorAction SilentlyContinue
$candidates += Get-ChildItem 'C:\Program Files\Java' -Directory -Filter 'jdk-17*' -ErrorAction SilentlyContinue
if ($candidates.Count -gt 0) { $jdk = ($candidates | Sort-Object Name -Descending | Select-Object -First 1).FullName }
if (-not $jdk) { Fail 'JDK 17 is missing. Install it with:  winget install EclipseAdoptium.Temurin.17.JDK   then run this script again.' }
$env:JAVA_HOME = $jdk
$env:Path = "$jdk\bin;$env:Path"
Write-Host "Java: $jdk"

$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = $env:ANDROID_SDK_ROOT }
if (-not $sdk) { $sdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
if (-not (Test-Path (Join-Path $sdk 'build-tools'))) { Fail "Android SDK not found at $sdk. Install Android Studio (winget install Google.AndroidStudio), open it once and finish the setup wizard, then run this script again." }
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
Write-Host "Android SDK: $sdk"

# --- Build -----------------------------------------------------------------
Push-Location $app
try {
  Step 'Installing Capacitor (first run takes a few minutes)'
  npm install --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { Fail 'npm install failed. Check your internet connection and try again.' }

  Step 'Copying the Sunshine web app'
  npm run prepare-web
  if ($LASTEXITCODE -ne 0) { Fail 'Copying the web app failed.' }

  if (-not (Test-Path (Join-Path $app 'android'))) {
    Step 'Creating the Android project'
    npx cap add android
    if ($LASTEXITCODE -ne 0) { Fail 'Creating the Android project failed.' }
  }
  npx cap sync android
  if ($LASTEXITCODE -ne 0) { Fail 'Syncing the Android project failed.' }
  $settings = Get-Content (Join-Path $app 'android\capacitor.settings.gradle') -Raw
  if ($settings -match 'capacitor-google-auth') { Write-Host 'Google sign-in plugin: included' -ForegroundColor Green }
  else { Fail 'The Google sign-in plugin was not added to the Android project. Send this message to Claude.' }

  Step 'Applying Sunshine icons, splash and reminder permissions'
  npm run customize
  if ($LASTEXITCODE -ne 0) { Fail 'Customising the Android project failed.' }

  Step 'Building the APK (first build downloads Gradle and can take 10+ minutes)'
  Push-Location (Join-Path $app 'android')
  try {
    .\gradlew.bat assembleRelease
    if ($LASTEXITCODE -ne 0) { Fail 'The Gradle build failed. Copy the red error lines above and send them to Claude.' }
  } finally { Pop-Location }
} finally { Pop-Location }

# --- Sign ------------------------------------------------------------------
Step 'Signing the APK'
$bt = Get-ChildItem (Join-Path $sdk 'build-tools') -Directory | Sort-Object { [version]($_.Name -replace '[^0-9.]','') } -Descending | Select-Object -First 1
$zipalign  = Join-Path $bt.FullName 'zipalign.exe'
$apksigner = Join-Path $bt.FullName 'apksigner.bat'
$version   = (Get-Content (Join-Path $app 'package.json') -Raw | ConvertFrom-Json).version
$unsigned  = Join-Path $app 'android\app\build\outputs\apk\release\app-release-unsigned.apk'
$aligned   = Join-Path $app 'android\app\build\outputs\apk\release\aligned.apk'
$out       = Join-Path $repo "Sunshine-$version.apk"

$secure = Read-Host 'Enter the Sunshine signing password' -AsSecureString
$env:SUNSHINE_KEY_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))

& $zipalign -p -f 4 $unsigned $aligned
if ($LASTEXITCODE -ne 0) { Fail 'zipalign failed.' }
& $apksigner sign --ks (Join-Path $app 'signing\sunshine-release.p12') --ks-type PKCS12 --ks-key-alias sunshine `
  --ks-pass env:SUNSHINE_KEY_PASSWORD --key-pass env:SUNSHINE_KEY_PASSWORD --out $out $aligned
$code = $LASTEXITCODE
Remove-Item Env:\SUNSHINE_KEY_PASSWORD
if ($code -ne 0) { Fail 'Signing failed. Check the password and try again.' }
& $apksigner verify $out
if ($LASTEXITCODE -ne 0) { Fail 'The signed APK did not verify.' }

Write-Host "`nDone! Your app is ready:" -ForegroundColor Green
Write-Host "  $out" -ForegroundColor Green
Write-Host "Send it to your phone (USB cable, Google Drive, or Phone Link) and open it to install."
Start-Process explorer.exe "/select,`"$out`""
