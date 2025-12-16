//const API = "http://127.0.0.1:5000";
const API = "https://srirobert.pythonanywhere.com/";

const wheelContainer = document.getElementById("wheel");
const resultBox = document.getElementById("result-box");

let memberNames = [];
let nameAngles = {};

/* -------- Generate Dynamic Colors -------- */
function generateWheelColors(count) {
    const colors = ["#ff0000", "#008000", "#ffd700"];
    const slice = 360 / count;
    let current = 0;
    let gradient = "";

    for (let i = 0; i < count; i++) {
        gradient += `${colors[i % colors.length]} ${current}deg ${current + slice}deg, `;
        current += slice;
    }

    wheelContainer.style.background =
        `conic-gradient(${gradient.slice(0, -2)})`;
}

/* -------- Populate Wheel -------- */
async function populateWheel() {
    const res = await fetch(`${API}/check-status`);
    const data = await res.json();

    if (!data.locked) {
        wheelContainer.innerHTML = "";
        return;
    }

    memberNames = Object.keys(data.pairs);
    const totalMembers = memberNames.length;
    if (totalMembers === 0) return;

    // Reset wheel
    wheelContainer.innerHTML = "";
    wheelContainer.style.transition = "none";
    wheelContainer.style.transform = "rotate(0deg)";
    nameAngles = {};

    generateWheelColors(totalMembers);

    const segmentAngle = 360 / totalMembers;
    const rect = wheelContainer.getBoundingClientRect();
    const baseRadius = Math.min(rect.width, rect.height) / 2;
    const radius = baseRadius - Math.max(30, totalMembers * 6);

 memberNames.forEach((name, i) => {
    const div = document.createElement("div");
    div.className = "wheel-name";
    div.textContent = name;

    const angle = i * segmentAngle + segmentAngle / 2;
    nameAngles[name] = angle;

    // place text in slice center, keep horizontal
    div.style.transform =
        `rotate(${angle}deg) translate(0, -${radius}px) rotate(${-angle}deg) translate(-50%, -50%)`;

    wheelContainer.appendChild(div);
});

}

/* -------- Spin -------- */
async function startSpin() {
    const name = document.getElementById("name").value.trim();
    if (!name) {
        alert("Enter your name!");
        return;
    }

    const res = await fetch(`${API}/get-pair/${name}`);
    const data = await res.json();

    if (!res.ok) {
        resultBox.textContent = data.error;
        return;
    }

    const assigned = data.your_assigned_person;
    const angle = nameAngles[assigned];

    if (angle === undefined) {
        resultBox.textContent = "Name not found on wheel";
        return;
    }

    wheelContainer.style.transition = "none";
    wheelContainer.style.transform = "rotate(0deg)";

    setTimeout(() => {
        const spins = 5;
        const rotateDeg = spins * 360 + (360 - angle);

        wheelContainer.style.transition =
            "transform 5s cubic-bezier(0.33, 1, 0.68, 1)";
        wheelContainer.style.transform = `rotate(${rotateDeg}deg)`;

        resultBox.textContent = "Spinning...";

        setTimeout(() => {
            resultBox.textContent =
                `You got: ${assigned} - ${data.their_address}`;
        }, 5000);
    }, 60);
}

/* -------- Init -------- */
populateWheel();
//setInterval(populateWheel, 8000);
