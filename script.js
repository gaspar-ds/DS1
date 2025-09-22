document.querySelectorAll("h2").forEach(h2 => {
  h2.addEventListener("mouseover", () => {
    h2.style.textShadow = "0 0 8px red, 0 0 16px #ff0000";
    setTimeout(() => h2.style.textShadow = "none", 300);
  });
});

function showProfile(username, picUrl) {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('userProfile').style.display = 'block';
  document.getElementById('profileUsername').textContent = username;
  document.getElementById('profilePic').src = picUrl || `https://i.pravatar.cc/80?u=${username}`;
}

// Login
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
  e.preventDefault(); // Esto es fundamental para evitar el refresco
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const msg = document.getElementById('loginMsg');
  try {
    const res = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const text = await res.text();
    msg.textContent = text;
    msg.style.color = res.ok ? 'limegreen' : 'red';
    if (res.ok) {
      setTimeout(() => {
        showProfile(username);
      }, 800);
    }
  } catch {
    msg.textContent = 'Error de conexión';
    msg.style.color = 'red';
  }
});

// Modal de registro
const openRegister = document.getElementById('openRegister');
const registerModal = document.getElementById('registerModal');
const closeRegister = document.getElementById('closeRegister');

openRegister?.addEventListener('click', () => {
  registerModal.classList.add('show');
});
closeRegister?.addEventListener('click', () => {
  registerModal.classList.remove('show');
});
window.addEventListener('click', (e) => {
  if (e.target === registerModal) registerModal.classList.remove('show');
});

// Registro de usuario (dentro del modal)
document.getElementById('registerModalForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;
  const msg = document.getElementById('registerMsg');
  try {
    const res = await fetch('http://localhost:3001/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const text = await res.text();
    msg.textContent = text;
    msg.style.color = res.ok ? 'limegreen' : 'red';
    if (res.ok) {
      setTimeout(() => {
        document.getElementById('registerModal').classList.remove('show');
        showProfile(username);
      }, 1200);
    }
  } catch {
    msg.textContent = 'Error de conexión';
    msg.style.color = 'red';
  }
});

document.getElementById('langBtn')?.addEventListener('click', () => {
  document.querySelector('h1').textContent = 'DS1 - Gaspar Doval';
  document.querySelector('nav ul').innerHTML = `
    <li><a href="#about">Profile</a></li>
    <li><a href="#skills">Skills</a></li>
    <li><a href="#projects">Projects</a></li>
    <li><a href="#contact">Contact</a></li>
  `;
  document.querySelector('#about h2').textContent = 'About me';
  document.querySelector('#about p').innerHTML = 'Hi, I\'m <strong>Gaspar Doval</strong> (DS1). Web and mobile developer, AI integration, login and payment systems.';
  document.querySelector('#skills h2').textContent = 'Skills';
  document.querySelector('#skills ul').innerHTML = `
    <li>🌐 Web & Mobile Development</li>
    <li>🤖 Artificial Intelligence Integration</li>
    <li>🔐 Login & Payment Systems</li>
    <li>📡 APIs & Social Media Integration</li>
    <li>🎮 3D & Augmented Reality Experiences</li>
  `;
  document.querySelector('#projects h2').textContent = 'Projects';
  document.querySelector('#projects p')?.remove();
  document.querySelector('#contact h2').textContent = 'Contact';
  document.querySelector('#contact p').textContent = 'You can write to me directly from the chat or my social networks.';
  document.querySelector('footer p').textContent = '© 2025 DS1 - Gaspar Doval';
  document.getElementById('langBtn').textContent = 'Español';
  document.getElementById('langBtn').onclick = () => location.reload();
});

const carousel = document.getElementById('socialCarousel');
if (carousel) {
  setInterval(() => {
    carousel.appendChild(carousel.firstElementChild);
  }, 2000);
}

// Menú lateral de perfil
const profileMenuBtn = document.getElementById('profileMenuBtn');
const profileMenu = document.getElementById('profileMenu');
profileMenuBtn?.addEventListener('click', () => {
  profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
});
window.addEventListener('click', (e) => {
  if (profileMenu && !profileMenu.contains(e.target) && e.target !== profileMenuBtn) {
    profileMenu.style.display = 'none';
  }
});

// Cerrar sesión
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  document.getElementById('userProfile').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
  // Aquí podrías limpiar sesión en backend si implementas sesiones
});

// Cambiar nombre
document.getElementById('changeNameBtn')?.addEventListener('click', async () => {
  const newName = prompt('Nuevo nombre de usuario:');
  if (newName) {
    // Llama a tu backend para actualizar el nombre
    const res = await fetch('http://localhost:3001/change-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: document.getElementById('profileUsername').textContent, newUsername: newName })
    });
    if (res.ok) {
      document.getElementById('profileUsername').textContent = newName;
      alert('Nombre actualizado');
    } else {
      alert('Error al cambiar nombre');
    }
  }
});

// Cambiar imagen de perfil
document.getElementById('changePicBtn')?.addEventListener('click', () => {
  document.getElementById('uploadPicForm').style.display = 'block';
});
document.getElementById('uploadPicForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const fileInput = document.getElementById('newPic');
  if (fileInput.files.length === 0) return;
  const formData = new FormData();
  formData.append('username', document.getElementById('profileUsername').textContent);
  formData.append('profilePic', fileInput.files[0]);
  const res = await fetch('http://localhost:3001/upload-profile-pic', {
    method: 'POST',
    body: formData
  });
  if (res.ok) {
    const data = await res.json();
    document.getElementById('profilePic').src = data.url;
    alert('Imagen actualizada');
    document.getElementById('uploadPicForm').style.display = 'none';
  } else {
    alert('Error al subir imagen');
  }
});

<script src="script.js"></script>



