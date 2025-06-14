// clientForm.js

function saveClientData() {
  const name = document.getElementById("name").value;
  // Bug: fatigue field is not captured
  console.log("Saving client:", name);
}

document.getElementById("saveBtn").addEventListener("click", saveClientData);
