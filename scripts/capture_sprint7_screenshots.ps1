$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}
if (-not (Test-Path $chromePath)) {
    $chromePath = "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
}

$artifactDir = "C:\Users\NUN\.gemini\antigravity\brain\ef2d7859-9626-4f7a-9d98-55723c3c59b2"

# 1. Desktop Professor Console (1440x900)
$out1 = Join-Path $artifactDir "screenshot_desktop_professor_console.png"
& $chromePath --headless --disable-gpu --window-size=1440,900 --hide-scrollbars --virtual-time-budget=4000 --screenshot=$out1 "http://localhost:3000/#/professor-console"

# 2. Mobile Professor Console (390x844)
$out2 = Join-Path $artifactDir "screenshot_mobile_professor_console.png"
& $chromePath --headless --disable-gpu --window-size=390,844 --hide-scrollbars --virtual-time-budget=4000 --screenshot=$out2 "http://localhost:3000/#/professor-console"

# 3. Desktop Learner Arena (1440x900)
$out3 = Join-Path $artifactDir "screenshot_desktop_learner_arena.png"
& $chromePath --headless --disable-gpu --window-size=1440,900 --hide-scrollbars --virtual-time-budget=4000 --screenshot=$out3 "http://localhost:3000/#/battle"

# 4. Mobile Learner Arena (390x844)
$out4 = Join-Path $artifactDir "screenshot_mobile_learner_arena.png"
& $chromePath --headless --disable-gpu --window-size=390,844 --hide-scrollbars --virtual-time-budget=4000 --screenshot=$out4 "http://localhost:3000/#/battle"

Write-Host "Sprint 7 screenshots captured successfully!"
