const loginForm = document.getElementById("loginForm");
const loginPanel = document.getElementById("loginPanel");
const registerPanel = document.getElementById("registerPanel");
const registerForm = document.getElementById("registerForm");
const showRegisterBtn = document.getElementById("showRegisterBtn");
const showLoginBtn = document.getElementById("showLoginBtn");
const registerMessage = document.getElementById("registerMessage");
const dashboard = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logoutBtn");
const openAddDevice = document.getElementById("openAddDevice");
const deviceModal = document.getElementById("deviceModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const closeModalBackdrop = document.getElementById("closeModalBackdrop");
const deviceForm = document.getElementById("deviceForm");
const deviceMessage = document.getElementById("deviceMessage");
const deviceList = document.getElementById("deviceList");
const template = document.getElementById("deviceCardTemplate");
const onlineCount = document.getElementById("onlineCount");
const activeRelayCount = document.getElementById("activeRelayCount");

const AUTH_STORAGE_KEY = "remotehub-demo-users";

const registry = [
  { serial: "ESP32-0001", secret: "alpha-001", valid: true },
  { serial: "ESP32-0007", secret: "relay-007", valid: true },
  { serial: "ESP32-0020", secret: "edge-020", valid: true },
];

const devices = [
  {
    id: 1,
    name: "Gate Relay",
    serial: "ESP32-0001",
    online: true,
    relay: false,
    ip: "172.20.10.7",
    token: "token-esp32-001",
    live: true,
  },
  {
    id: 2,
    name: "Living Room",
    serial: "ESP32-0007",
    online: true,
    relay: true,
    live: false,
  },
  {
    id: 3,
    name: "Pump Control",
    serial: "ESP32-0020",
    online: true,
    relay: true,
    live: false,
  },
];

function getStoredUsers() {
  return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "[]");
}

function saveStoredUsers(users) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
}

function showLogin() {
  registerPanel.classList.add("hidden");
  dashboard.classList.add("hidden");
  loginPanel.classList.remove("hidden");
}

function showRegister() {
  loginPanel.classList.add("hidden");
  registerPanel.classList.remove("hidden");
}

function updateStats() {
  onlineCount.textContent = devices.filter((device) => device.online).length;
  activeRelayCount.textContent = devices.filter((device) => device.relay).length;
}

async function sendDeviceCommand(device, action) {
  if (!device.live || !device.ip || !device.token) {
    if (action === "on") {
      device.relay = true;
    } else if (action === "off") {
      device.relay = false;
    } else {
      device.relay = !device.relay;
    }
    return;
  }

  const response = await fetch(`http://${device.ip}/api/${action}?token=${device.token}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Command failed with status ${response.status}`);
  }

  const data = await response.json();
  device.relay = data.relay;
  device.online = data.wifiConnected;
}

async function fetchDeviceStatus(device) {
  if (!device.live || !device.ip || !device.token) {
    return;
  }

  const response = await fetch(`http://${device.ip}/api/status?token=${device.token}`);
  if (!response.ok) {
    throw new Error(`Status failed with status ${response.status}`);
  }

  const data = await response.json();
  device.relay = data.relay;
  device.online = data.wifiConnected;
}

function renderDevices() {
  deviceList.innerHTML = "";

  devices.forEach((device) => {
    const node = template.content.firstElementChild.cloneNode(true);
    const name = node.querySelector(".device-name");
    const meta = node.querySelector(".device-meta");
    const badge = node.querySelector(".status-badge");
    const onButton = node.querySelector(".btn-device-on");
    const offButton = node.querySelector(".btn-device-off");
    const toggleButton = node.querySelector(".btn-device-toggle");

    name.textContent = device.name;
    meta.textContent = `${device.serial} • Relay ${device.relay ? "ON" : "OFF"}${device.live ? ` • ${device.ip}` : " • Demo"}`;
    badge.textContent = device.online ? "Online" : "Offline";
    badge.classList.add(device.online ? "online" : "offline");

    onButton.addEventListener("click", async () => {
      try {
        await sendDeviceCommand(device, "on");
        renderDevices();
      } catch (error) {
        alert(`ON failed for ${device.name}: ${error.message}`);
      }
    });

    offButton.addEventListener("click", async () => {
      try {
        await sendDeviceCommand(device, "off");
        renderDevices();
      } catch (error) {
        alert(`OFF failed for ${device.name}: ${error.message}`);
      }
    });

    toggleButton.addEventListener("click", async () => {
      try {
        await sendDeviceCommand(device, "toggle");
        renderDevices();
      } catch (error) {
        alert(`TOGGLE failed for ${device.name}: ${error.message}`);
      }
    });

    deviceList.appendChild(node);
  });

  updateStats();
}

function openModal() {
  deviceModal.classList.remove("hidden");
}

function closeModal() {
  deviceModal.classList.add("hidden");
  deviceForm.reset();
  deviceMessage.textContent =
    "Demo validation checks a mock list. Final version should validate with backend.";
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const users = getStoredUsers();
  const matchedUser = users.find((user) => user.email === email && user.password === password);

  if (users.length > 0 && !matchedUser) {
    alert("Login failed. Use a registered account or clear demo storage.");
    return;
  }

  loginPanel.classList.add("hidden");
  registerPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
  renderDevices();
});

logoutBtn.addEventListener("click", () => {
  showLogin();
});

openAddDevice.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
closeModalBackdrop.addEventListener("click", closeModal);
showRegisterBtn.addEventListener("click", showRegister);
showLoginBtn.addEventListener("click", showLogin);

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim().toLowerCase();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("registerConfirmPassword").value;

  if (password.length < 8) {
    registerMessage.textContent = "Password should be at least 8 characters.";
    return;
  }

  if (password !== confirmPassword) {
    registerMessage.textContent = "Password confirmation does not match.";
    return;
  }

  const users = getStoredUsers();
  if (users.find((user) => user.email === email)) {
    registerMessage.textContent = "This email is already registered in demo storage.";
    return;
  }

  users.push({ name, email, password });
  saveStoredUsers(users);
  registerMessage.textContent = "Registration completed. You can log in now.";
  registerForm.reset();
});

deviceForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("deviceName").value.trim();
  const serial = document.getElementById("deviceSerial").value.trim().toUpperCase();
  const secret = document.getElementById("deviceSecret").value.trim();

  const existsInRegistry = registry.find(
    (item) => item.serial === serial && item.secret === secret && item.valid
  );
  const existsInUserList = devices.find((device) => device.serial === serial);

  if (!existsInRegistry) {
    deviceMessage.textContent =
      "Device validation failed. This serial or secret is not registered in the whitelist.";
    return;
  }

  if (existsInUserList) {
    deviceMessage.textContent = "This device is already registered in the dashboard.";
    return;
  }

  devices.unshift({
    id: Date.now(),
    name,
    serial,
    online: true,
    relay: false,
    live: false,
  });

  deviceMessage.textContent =
    "Device validated successfully. In the final system this step should come from backend + Google Sheet or database.";
  renderDevices();

  setTimeout(() => {
    closeModal();
  }, 900);
});

async function refreshLiveDevices() {
  const liveDevices = devices.filter((device) => device.live);

  for (const device of liveDevices) {
    try {
      await fetchDeviceStatus(device);
    } catch (error) {
      device.online = false;
    }
  }

  if (!dashboard.classList.contains("hidden")) {
    renderDevices();
  }
}

setInterval(refreshLiveDevices, 5000);
