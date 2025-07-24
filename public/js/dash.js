document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initDashboard();
});

function initDashboard() {
    // Set up toggle visibility for password fields
    setupPasswordToggles();

    // Set up time input handlers
    setupTimeInputs();

    // Set up subscription time handlers
    setupSubscriptionTimeInputs();

    // Set up timer
    setupTimerColors();

    document.getElementById('saveButton').addEventListener('click', saveConfiguration);
    document.getElementById('gotoTimer').addEventListener("click", gotoTimer);
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
}

function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-visibility');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const inputElement = document.getElementById(targetId);

            if (inputElement.type === 'password') {
                inputElement.type = 'text';
                this.querySelector('.eye-icon').textContent = '🔒';
            } else {
                inputElement.type = 'password';
                this.querySelector('.eye-icon').textContent = '👁️';
            }
        });
    });
}

function parseCookies() {
    const obj = {};
    document.cookie.split("; ").forEach(cookie => {
        let [key, val] = cookie.split('=');
        obj[key] = val;
    });

    return obj;
}

function setupTimeInputs() {
    // Initial time inputs
    const initialHours = document.getElementById('initialHours');
    const initialMinutes = document.getElementById('initialMinutes');
    const initialSeconds = document.getElementById('initialSeconds');

    // Max time inputs
    const maxHours = document.getElementById('maxHours');
    const maxMinutes = document.getElementById('maxMinutes');
    const maxSeconds = document.getElementById('maxSeconds');

    // Add event listeners to update previews
    [initialHours, initialMinutes, initialSeconds].forEach(input => {
        input.addEventListener('input', updateInitialTimePreview);
        input.addEventListener('change', validateTimeInput);
    });

    [maxHours, maxMinutes, maxSeconds].forEach(input => {
        input.addEventListener('input', updateMaxTimePreview);
        input.addEventListener('change', validateTimeInput);
    });

    // Initialize previews
    updateInitialTimePreview();
    updateMaxTimePreview();
}

function setupSubscriptionTimeInputs() {
    // Subscription time inputs
    const timePerSubTier1 = document.getElementById('timePerSubTier1');
    const timePerSubTier2 = document.getElementById('timePerSubTier2');
    const timePerSubTier3 = document.getElementById('timePerSubTier3');
    const timePerBits = document.getElementById("timePerBits");
    const timePerGift = document.getElementById('timePerGift');
    const minBits = document.getElementById("minBits");

    // Add event listeners to update previews
    timePerSubTier1.addEventListener('input', () => updateTimePreview('timePerSubTier1'));
    timePerSubTier2.addEventListener('input', () => updateTimePreview('timePerSubTier2'));
    timePerSubTier3.addEventListener('input', () => updateTimePreview('timePerSubTier3'));
    timePerGift.addEventListener('input', () => updateTimePreview('timePerGift'));

    timePerBits.addEventListener("input", () => updateTimePreview("timePerBits"));
    minBits.addEventListener("input", () => updateTimePreview("timePerBits"));


    // Initialize previews
    updateTimePreview('timePerSubTier1');
    updateTimePreview('timePerSubTier2');
    updateTimePreview('timePerSubTier3');
    updateTimePreview('timePerGift');
    updateTimePreview("timePerBits");
}

function setupTimerColors() {
    const backgroundColor = document.getElementById("backgroundColor");
    const shadowColor = document.getElementById("shadowColor");
    const textColor = document.getElementById("textColor");

    [backgroundColor, shadowColor, textColor].forEach(elem => {
        elem.addEventListener("input", updateTimerPreview);
    });

    updateTimerPreview();
}

function updateTimerPreview() {
    const container = document.getElementById("container");
    const text = document.querySelector("#timeText");

    const backgroundColor = document.getElementById("backgroundColor");
    const shadowColor = document.getElementById("shadowColor");
    const textColor = document.getElementById("textColor");

    container.style.backgroundColor = backgroundColor.value;
    container.style.boxShadow = `0 0 1.5rem 1rem ${shadowColor.value}`;
    text.style.color = textColor.value;
}

function validateTimeInput(event) {
    const input = event.target;
    let value = parseInt(input.value.toString()) || 0;

    // Ensure value is not negative
    if (value < 0) value = 0;

    // For minutes and seconds, ensure value is less than 60
    if (input.id.includes('Minutes') || input.id.includes('Seconds')) {
        if (value > 59) value = 59;
    }

    input.value = value;
}

function updateInitialTimePreview() {
    const hours = parseInt(document.getElementById('initialHours').value) || 0;
    const minutes = parseInt(document.getElementById('initialMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('initialSeconds').value) || 0;

    document.getElementById('initialTimePreview').textContent = formatTime(hours, minutes, seconds);
}

function updateMaxTimePreview() {
    const hours = parseInt(document.getElementById('maxHours').value) || 0;
    const minutes = parseInt(document.getElementById('maxMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('maxSeconds').value) || 0;

    document.getElementById('maxTimePreview').textContent = formatTime(hours, minutes, seconds);
}

function updateTimePreview(inputId) {
    const seconds = parseInt(document.getElementById(inputId).value) || 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if(inputId.includes("Gift")) {
        document.getElementById(`${inputId}Preview`).textContent =
            `${minutes}m ${remainingSeconds}s per dollar`;
    }
    else if(inputId.includes("Sub")) {
        document.getElementById(`${inputId}Preview`).textContent =
            `${minutes}m ${remainingSeconds}s per sub`;
    }
    else {
        let v = document.getElementById("minBits").value
        document.getElementById(`${inputId}Preview`).textContent =
            `${minutes}m ${remainingSeconds}s per ${v} bits`;
    }
}

function formatTime(hours, minutes, seconds) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Check for saved theme preference when page loads
(function() {
    // Default to dark mode if no preference is saved
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
})();

function saveConfiguration() {
    // Collect all configuration data
    const config = {
        pallySlug: document.getElementById('pallySlug').value,
        apiToken: document.getElementById('apiToken').value,
        streamElementsToken: document.getElementById('streamElementsToken').value,
        initialTime: {
            hours: parseInt(document.getElementById('initialHours').value) || 0,
            minutes: parseInt(document.getElementById('initialMinutes').value) || 0,
            seconds: parseInt(document.getElementById('initialSeconds').value) || 0
        },
        maxTime: {
            hours: parseInt(document.getElementById('maxHours').value) || 0,
            minutes: parseInt(document.getElementById('maxMinutes').value) || 0,
            seconds: parseInt(document.getElementById('maxSeconds').value) || 0
        },
        times: {
            tier1: parseInt(document.getElementById('timePerSubTier1').value) || 0,
            tier2: parseInt(document.getElementById('timePerSubTier2').value) || 0,
            tier3: parseInt(document.getElementById('timePerSubTier3').value) || 0,
            gift: parseInt(document.getElementById('timePerGift').value) || 0
        },
        bits: {
            min: parseInt(document.getElementById("minBits").value) || 0,
            per: parseInt(document.getElementById("timePerBits").value) || 0
        },
        timer: {
            background: document.getElementById("backgroundColor").value,
            shadow: document.getElementById("shadowColor").value,
            text: document.getElementById("textColor").value
        }
    };

    fetch(document.location.href, {
        method: "POST",
        body: JSON.stringify(config),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => {
        console.log(res);
        let save = document.getElementById("save");
        if(res.ok) {
            save.innerText = "👍";
            setTimeout(() => {
                save.innerText = "💾"
            }, 3000);
        } else {
            save.innerText = "👎";
            setTimeout(() => {
                save.innerText = "💾"
            }, 3000);
        }
    });
}

function gotoTimer() {
    const cookies = parseCookies()
    window.location.href = `${window.location.origin}/timer/${cookies.secret}`;
}