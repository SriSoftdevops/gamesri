from flask import Flask, request, jsonify
from flask_cors import CORS
import json, random, time, os

app = Flask(__name__)
CORS(app)

DATA_FILE = "data.json"
TOTAL_MEMBERS = 9
WAIT_TIME = 12 * 60 * 60   # 12 hours in seconds

# ---------------- Utility Functions ----------------
def load_data():
    if not os.path.exists(DATA_FILE):
        return {"members": {}, "start_time": None, "pairs": {}, "locked": False}
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

def auto_generate_pairs(data):
    """Generate pairs in a circular way"""
    members = list(data["members"].keys())
    random.shuffle(members)
    pairs = {}
    for i in range(len(members)):
        giver = members[i]
        receiver = members[(i + 1) % len(members)]
        pairs[giver] = receiver
    data["pairs"] = pairs
    data["locked"] = True
    save_data(data)
    return pairs

def check_and_generate_pairs():
    """Check if all members registered or wait_time passed"""
    data = load_data()
    if data["locked"]:
        return data["pairs"]

    # Case 1: All members registered → generate immediately
    if len(data["members"]) == TOTAL_MEMBERS:
        return auto_generate_pairs(data)

    # Case 2: 12 hours passed → generate for current members
    if data["start_time"] and time.time() - data["start_time"] >= WAIT_TIME:
        return auto_generate_pairs(data)

    # Otherwise, do not generate yet
    return None

# ---------------- API Endpoints ----------------
@app.route("/register", methods=["POST"])
def register():
    data = load_data()
    if data["locked"]:
        return jsonify({"message": "Registration closed. Pairs already generated."}), 403

    body = request.json
    name = body.get("name")
    address = body.get("address")

    if not name or not address:
        return jsonify({"error": "Name and address required"}), 400

    data["members"][name] = address

    # Start timer on first registration
    if not data["start_time"]:
        data["start_time"] = time.time()

    save_data(data)

    # Check if we can generate pairs
    pairs = check_and_generate_pairs()
    if pairs:
        return jsonify({"message": "Pairs generated!", "pairs": pairs})

    return jsonify({"message": "Registered successfully", "total_submitted": len(data["members"])})


@app.route("/check-status", methods=["GET"])
def check_status():
    data = load_data()
    pairs = check_and_generate_pairs()

    if data["locked"]:
        return jsonify({"locked": True, "message": "Pairs generated", "pairs": data["pairs"]})

    remaining = TOTAL_MEMBERS - len(data["members"])
    return jsonify({
        "locked": False,
        "submitted": len(data["members"]),
        "remaining": remaining
    })


@app.route("/get-pair/<name>", methods=["GET"])
def get_pair(name):
    data = load_data()
    if not data["locked"]:
        return jsonify({"error": "Pairs not generated yet"}), 400

    if name not in data["pairs"]:
        return jsonify({"error": "User not found or not part of pairing"}), 404

    receiver = data["pairs"][name]
    receiver_address = data["members"][receiver]

    return jsonify({
        "your_name": name,
        "your_assigned_person": receiver,
        "their_address": receiver_address
    })


if __name__ == "__main__":
    app.run(debug=True)
