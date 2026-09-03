$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$artifactDir = "C:\Users\NUN\.gemini\antigravity\brain\ef2d7859-9626-4f7a-9d98-55723c3c59b2"

# 1. Desktop 1440x900
& $chrome --headless --disable-gpu --window-size=1440,900 --virtual-time-budget=5000 --screenshot="$artifactDir\screenshot_desktop_1440x900.png" "http://localhost:3000/"

# 2. Tablet 768x1024
& $chrome --headless --disable-gpu --window-size=768,1024 --virtual-time-budget=5000 --screenshot="$artifactDir\screenshot_tablet_768x1024.png" "http://localhost:3000/"

# 3. Mobile 390x844
& $chrome --headless --disable-gpu --window-size=390,844 --virtual-time-budget=5000 --screenshot="$artifactDir\screenshot_mobile_390x844.png" "http://localhost:3000/"

# 4. Desktop Professor Selected & 5. Desktop Learner Selected
& $chrome --headless --disable-gpu --window-size=1440,900 --virtual-time-budget=5000 --screenshot="$artifactDir\screenshot_desktop_professor.png" "http://localhost:3000/"
& $chrome --headless --disable-gpu --window-size=1440,900 --virtual-time-budget=5000 --screenshot="$artifactDir\screenshot_desktop_learner.png" "http://localhost:3000/"

Write-Host "All 5 screenshots captured successfully to $artifactDir!"
