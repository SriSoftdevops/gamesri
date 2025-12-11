//const API = " http://127.0.0.1:5000"; 
const API = "https://srirobert.pythonanywhere.com/";

// Register user
async function registerAddress() {
    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!name || !address) {
        alert("Please fill both fields!");
        return;
    }

    const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) document.getElementById("go-spin").classList.remove("hidden");
}

// Update status
async function updateStatus() {
    const res = await fetch(`${API}/check-status`);
    const data = await res.json();

    const statusBox = document.getElementById("status-box");
    if (data.locked) {
        statusBox.textContent = "Pairs already generated!";
        document.getElementById("go-spin").classList.remove("hidden");
    } else {
        statusBox.textContent = `Submitted: ${data.submitted || 0}, Remaining: ${data.remaining || 0}`;
    }

    setTimeout(updateStatus, 5000);
}

updateStatus();
