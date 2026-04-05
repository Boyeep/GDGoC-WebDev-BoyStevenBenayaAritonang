const PARTICIPANTS_KEY = "gdgoc-task1-participants";
const MAX_SPOTS = 24;

const form = document.getElementById("registration-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const trackSelect = document.getElementById("track");
const goalInput = document.getElementById("goal");
const updatesInput = document.getElementById("updates");
const feedback = document.getElementById("feedback");
const customSelect = document.getElementById("track-select");
const trackTrigger = document.getElementById("track-trigger");
const trackValue = document.getElementById("track-value");
const trackOptions = Array.from(document.querySelectorAll(".select-option"));
const trackMenu = document.getElementById("track-options");
const participantsList = document.getElementById("participants-list");
const emptyState = document.getElementById("empty-state");
const registeredCount = document.getElementById("registered-count");
const spotsLeft = document.getElementById("spots-left");
const submitButton = document.getElementById("submit-button");

let participants = loadParticipants();

function openSelect() {
    customSelect.classList.add("is-open");
    trackMenu.hidden = false;
    trackTrigger.setAttribute("aria-expanded", "true");
}

function closeSelect() {
    customSelect.classList.remove("is-open");
    trackMenu.hidden = true;
    trackTrigger.setAttribute("aria-expanded", "false");
}

function setTrack(value) {
    trackSelect.value = value;
    trackValue.textContent = value;

    for (const option of trackOptions) {
        const isSelected = option.dataset.value === value;
        option.classList.toggle("is-selected", isSelected);
        option.setAttribute("aria-selected", String(isSelected));
    }
}

function loadParticipants() {
    try {
        const stored = localStorage.getItem(PARTICIPANTS_KEY);
        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveParticipants() {
    try {
        localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants));
    } catch {
        showFeedback("Saved only for this session.", "info");
    }
}

function showFeedback(message, state) {
    feedback.textContent = message;

    if (state) {
        feedback.dataset.state = state;
    } else {
        delete feedback.dataset.state;
    }
}

function updateStats() {
    const remaining = Math.max(MAX_SPOTS - participants.length, 0);
    registeredCount.textContent = `${participants.length} ${participants.length === 1 ? "builder" : "builders"}`;
    spotsLeft.textContent = remaining > 0 ? `${remaining} seats left` : "Session full";
    submitButton.disabled = remaining === 0;
}

function renderParticipants() {
    participantsList.innerHTML = "";
    const orderedParticipants = [...participants].reverse();

    emptyState.hidden = participants.length > 0;

    if (!participants.length) {
        emptyState.textContent = "No participants yet.";
        updateStats();
        return;
    }

    for (const participant of orderedParticipants) {
        const item = document.createElement("li");
        item.className = "participant-card";

        const title = document.createElement("h3");
        title.className = "participant-name";
        title.textContent = participant.name;

        const details = document.createElement("p");
        details.className = "participant-details";
        details.textContent = participant.track;

        item.append(title, details);
        participantsList.appendChild(item);
    }

    updateStats();
}

function isDuplicateEmail(email) {
    return participants.some(
        (participant) => participant.email.toLowerCase() === email.toLowerCase()
    );
}

function validateForm({ name, email, goal }) {
    if (participants.length >= MAX_SPOTS) {
        return "Registration is closed.";
    }

    if (name.length < 3) {
        return "Please enter a full name.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return "Please enter a valid email.";
    }

    if (isDuplicateEmail(email)) {
        return "This email is already registered.";
    }

    if (goal.length < 12) {
        return "Please write a short goal.";
    }

    return "";
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const newParticipant = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        track: trackSelect.value,
        goal: goalInput.value.trim(),
        updates: updatesInput.checked
    };

    const errorMessage = validateForm(newParticipant);
    if (errorMessage) {
        showFeedback(errorMessage, "error");
        return;
    }

    participants = [newParticipant, ...participants];
    saveParticipants();
    form.reset();
    renderParticipants();
    showFeedback("Registration submitted.", "success");
});

form.addEventListener("input", () => {
    if (feedback.dataset.state === "error") {
        showFeedback("", "");
    }
});

trackTrigger.addEventListener("click", () => {
    if (customSelect.classList.contains("is-open")) {
        closeSelect();
        return;
    }

    openSelect();
});

trackOptions.forEach((option) => {
    option.addEventListener("click", () => {
        setTrack(option.dataset.value);
        closeSelect();
        trackTrigger.focus();
    });
});

document.addEventListener("click", (event) => {
    if (!customSelect.contains(event.target)) {
        closeSelect();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSelect();
    }
});

setTrack(trackSelect.value);
renderParticipants();
