$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$artifactDir = "C:\Users\NUN\.gemini\antigravity\brain\ef2d7859-9626-4f7a-9d98-55723c3c59b2"

# 1. Desktop & Mobile Landing
& $chrome --headless --disable-gpu --window-size=1440,900 --virtual-time-budget=4000 --screenshot="$artifactDir\screenshot_desktop_sprint5_landing.png" "http://localhost:3000/"
& $chrome --headless --disable-gpu --window-size=390,844 --virtual-time-budget=4000 --screenshot="$artifactDir\screenshot_mobile_sprint5_landing.png" "http://localhost:3000/"

Write-Host "Sprint 5 screenshots captured successfully!"
