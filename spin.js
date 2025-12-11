//const API = "http://127.0.0.1:5000";
const API = "https://srirobert.pythonanywhere.com/";

const wheelContainer = document.getElementById("wheel");
const resultBox = document.getElementById("result-box");

// Dynamic member names and their angles
let memberNames = [];
let nameAngles = {};

// Populate wheel from backend
async function populateWheel() {
    const res = await fetch(`${API}/check-status`);
    const data = await res.json();

    if (!data.locked) {
        alert("Pairs not generated yet. Wait until all members register!");
        return;
    }

    memberNames = Object.keys(data.pairs);
    wheelContainer.innerHTML = ""; // clear previous
    nameAngles = {};

    const totalMembers = memberNames.length;
    const segmentAngle = 360 / totalMembers;

    const rect = wheelContainer.getBoundingClientRect();
    const radius = Math.min(rect.width, rect.height) / 2 - 40;

    memberNames.forEach((name, i) => {
        // Name element
        const div = document.createElement("div");
        div.className = "wheel-name";
        div.textContent = name;
        div.style.left = "50%";
        div.style.top = "50%";
        div.style.width = "120px";
        div.style.marginLeft = "-60px";
        div.style.textAlign = "center";

        const angle = i * segmentAngle + segmentAngle / 2;
        nameAngles[name] = angle;

        div.style.transform = `rotate(${angle}deg) translate(0, -${radius}px) rotate(${-angle}deg)`;
        wheelContainer.appendChild(div);
    });
}

// Spin wheel
async function startSpin() {
    const name = document.getElementById("name").value.trim();
    if (!name) return alert("Enter your name!");

    const res = await fetch(`${API}/get-pair/${name}`);
    const data = await res.json();
    if (!res.ok) {
        resultBox.textContent = data.error;
        return;
    }

    const assignedPerson = data.your_assigned_person;
    const angle = nameAngles[assignedPerson];
    if (angle === undefined) return;

    // Reset rotation first
    wheelContainer.style.transition = "none";
    wheelContainer.style.transform = "rotate(0deg)";

    setTimeout(() => {
        const spins = 5;
        const rotateDeg = spins * 360 + (360 - angle);

        wheelContainer.style.transition = "transform 5s cubic-bezier(0.33, 1, 0.68, 1)";
        wheelContainer.style.transform = `rotate(${rotateDeg}deg)`;

        resultBox.textContent = "Spinning...";

        setTimeout(() => {
            resultBox.textContent = `You got: ${assignedPerson} - ${data.their_address}`;
        }, 5000);
    }, 50);
}

// Call on page load
populateWheel();
