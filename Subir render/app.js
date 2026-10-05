(() => {
  const users = {
    vania: { name: 'Vania Abanto', role: 'Investigadora', initials: 'VA', photo: 'photos/6a7a035c92ec580bc9b31e94.jpg', count: 24 },
    jonathan: { name: 'Jonathan Arzapalo', role: 'Instructor/a', initials: 'JA', photo: 'photos/6a7a03a592ec580bc9b31e95.jpg', count: 5 },
    fiorela: { name: 'Fiorela Bocanegra', role: 'Instructor/a', initials: 'FB', photo: 'photos/6ac326c2883fe07171533e84.jpg', count: 10 }
  };
  const patients = ['Adriana Cárdenas', 'Alejandra Ríos', 'Alonso Huamán', 'Bruno Medina', 'Carla Paredes', 'Daniela Soto', 'Emilia Torres', 'Gabriela Salas', 'María Flores', 'Nicolás León', 'Paula Vargas', 'Renata Díaz', 'Sebastián Cruz', 'Sofía Campos', 'Valeria Mendoza'];
  const sessions = [
    ['04/10/2026', 'Valeria Mendoza', 'Vania Abanto', '04:20'],
    ['04/10/2026', 'Bruno Medina', 'Jonathan Arzapalo', '03:46'],
    ['04/10/2026', 'Sofía Campos', 'Fiorela Bocanegra', '02:18'],
    ['03/10/2026', 'Adriana Cárdenas', 'Vania Abanto', '05:10'],
    ['03/10/2026', 'María Flores', 'Jonathan Arzapalo', '01:52']
  ];
  let currentUser = users.vania;
  let currentKey = 'vania';
  let pressureChart = null;
  let weeklyChart = null;
  let simTimer = null;
  let simStart = 0;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const initials = name => name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 2800);
  }

  function avatarElement(element, user, override = null) {
    if (!element) return;
    const photo = override || localStorage.getItem(`vanbreast-photo-${currentKey}`) || user.photo;
    element.textContent = photo ? '' : user.initials;
    element.style.backgroundImage = photo ? `url("${photo}")` : '';
    element.setAttribute('aria-label', user.name);
  }

  function applyUser(userKey) {
    currentKey = userKey;
    currentUser = users[userKey];
    $('#sideName').textContent = currentUser.name;
    $('#sideRole').textContent = currentUser.role;
    $('#settingsName').textContent = currentUser.name;
    $('#settingsRole').textContent = currentUser.role;
    avatarElement($('#sideAvatar'), currentUser);
    avatarElement($('#settingsAvatar'), currentUser);
    $('#trainingInstructor').textContent = currentUser.name;
    renderInstructors();
  }

  function openApp() {
    $('#loginView').hidden = true;
    $('#appView').hidden = false;
    renderHome();
    renderHistory();
    renderWeeklyChart();
    updateClock();
    window.setInterval(updateClock, 1000);
  }

  function updateClock() {
    const now = new Date();
    const date = now.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '').toUpperCase();
    $('#headerClock').textContent = `${date} · ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`;
  }

  function goTo(screen) {
    $$('.screen').forEach(section => { section.hidden = section.id !== `screen-${screen}`; });
    $$('[data-screen]').forEach(button => button.classList.toggle('active', button.dataset.screen === screen));
    $('#sidebar').classList.remove('open');
    $('#mobileScrim').hidden = true;
    if (screen === 'people') renderInstructors();
    if (screen === 'settings') { avatarElement($('#settingsAvatar'), currentUser); }
    if (screen === 'training') { renderPoints(); ensurePressureChart(); }
  }

  function renderHome() {
    $('#recentSessions').innerHTML = sessions.slice(0, 4).map(row => `<div class="session-row"><span>${row[0]}</span><div><strong>${row[1]}</strong><small>${row[2]}</small></div><span>${row[3]}</span><span class="status-ok">Completada</span></div>`).join('');
    const options = $('#patientOptions');
    options.innerHTML = patients.map(name => `<button type="button" data-patient="${name}">${name}</button>`).join('');
    $$('#patientOptions button').forEach(button => button.addEventListener('click', () => { $('#patientSearch').value = button.dataset.patient; options.hidden = true; }));
  }

  function renderHistory() {
    $('#historyRows').innerHTML = sessions.concat(sessions.slice(0, 3)).map(row => `<tr><td>${row[0]}</td><td><strong>${row[1]}</strong></td><td>${row[2]}</td><td>${row[3]}</td><td class="status-ok">Completada</td></tr>`).join('');
  }

  function renderInstructors() {
    $('#instructorGrid').innerHTML = Object.entries(users).map(([key, user]) => {
      const savedPhoto = localStorage.getItem(`vanbreast-photo-${key}`) || user.photo;
      const style = savedPhoto ? `style="background-image:url('${savedPhoto}')"` : '';
      return `<article class="instructor-card" data-user="${key}"><span class="avatar avatar--photo" ${style}>${savedPhoto ? '' : user.initials}</span><h3>${user.name}</h3><small>${user.role}</small><div class="instructor-count">${user.count}<small>pacientes registrados</small></div></article>`;
    }).join('');
    $$('.instructor-card').forEach(card => card.addEventListener('click', () => { applyUser(card.dataset.user); goTo('settings'); showToast(`Perfil de ${currentUser.name}`); }));
  }

  function renderPoints() {
    const positions = [[48,39],[61,38],[68,48],[61,60],[49,64],[39,58],[35,45],[42,33]];
    $('#explorationPoints').innerHTML = positions.map((position, index) => `<button class="exploration-point ${index === 0 ? 'current' : ''}" style="left:${position[0]}%;top:${position[1]}%" data-point="${index + 1}">${index + 1}</button>`).join('');
    $$('.exploration-point').forEach(point => point.addEventListener('click', () => { $$('.exploration-point').forEach(item => item.classList.remove('current')); point.classList.add('current'); $('#activePoint').textContent = point.dataset.point; }));
  }

  function renderWeeklyChart() {
    if (!window.Chart || weeklyChart) return;
    weeklyChart = new Chart($('#weeklyChart'), { type: 'bar', data: { labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'], datasets: [{ data: [0, 0, 0, 0, 0, 0, 15], backgroundColor: '#bc68ab', borderRadius: 9, barThickness: 21 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false, beginAtZero: true, suggestedMax: 17 }, x: { grid: { display: false }, ticks: { color: '#267b7e', font: { weight: '700' } } } } } });
  }

  function ensurePressureChart() {
    if (!window.Chart) return;
    if (!pressureChart) {
      const labels = Array.from({ length: 32 }, (_, index) => index);
      pressureChart = new Chart($('#pressureChart'), { type: 'line', data: { labels, datasets: [{ label: 'Índice', data: labels.map((_, i) => 13.5 + 3.8 * Math.sin(i / 4)), borderColor: '#238ca5', backgroundColor: 'rgba(35,140,165,.1)', fill: true, tension: .45, pointRadius: 0 }, { label: 'Medio', data: labels.map((_, i) => 13.5 + 3.8 * Math.sin(i / 4 + Math.PI / 2)), borderColor: '#bb68b2', backgroundColor: 'rgba(187,104,178,.08)', fill: true, tension: .45, pointRadius: 0 }] }, options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { min: 0, max: 20, ticks: { stepSize: 2, color: '#876f72', callback: value => `${value} N` }, grid: { color: '#eadfe2' } } } } });
    }
    startSimulation();
  }

  function startSimulation() {
    if (simTimer) return;
    simStart = performance.now();
    simTimer = window.setInterval(() => {
      const elapsed = (performance.now() - simStart) / 1000;
      const index = 13.5 + 3.8 * Math.sin(elapsed * 1.25);
      const middle = 13.5 + 3.8 * Math.sin(elapsed * 1.25 + Math.PI / 2);
      updateReading('index', index);
      updateReading('middle', middle);
      if (pressureChart) { pressureChart.data.datasets[0].data.push(index); pressureChart.data.datasets[1].data.push(middle); pressureChart.data.labels.push(''); if (pressureChart.data.labels.length > 48) { pressureChart.data.labels.shift(); pressureChart.data.datasets.forEach(dataset => dataset.data.shift()); } pressureChart.update('none'); }
      const seconds = Math.floor(elapsed) % 3600; $('#sessionTimer').textContent = `${String(14 - Math.floor(seconds / 60)).padStart(2, '0')}:${String(48 - seconds % 60 < 0 ? 60 + (48 - seconds % 60) : 48 - seconds % 60).padStart(2, '0')}`;
    }, 180);
  }

  function updateReading(type, value) {
    const rounded = value.toFixed(1);
    $(`#${type}Value`).innerHTML = `${rounded} <small>N</small>`;
    const gauge = Math.max(8, Math.min(100, value / 20 * 100));
    $(`#${type}Gauge`).style.height = `${gauge}%`;
    const range = $(`#${type}Range`);
    const ok = value >= 10 && value <= 17;
    range.className = `range ${ok ? 'range--ok' : 'range--bad'}`;
    range.textContent = ok ? '● Dentro del rango' : '● Fuera del rango';
  }

  function loadPhoto(file) {
    if (!file || !file.type.startsWith('image/')) { showToast('Selecciona un archivo de imagen.'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('La imagen no puede superar 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { localStorage.setItem(`vanbreast-photo-${currentKey}`, reader.result); avatarElement($('#sideAvatar'), currentUser, reader.result); avatarElement($('#settingsAvatar'), currentUser, reader.result); renderInstructors(); showToast('Foto actualizada en esta demo.'); };
    reader.readAsDataURL(file);
  }

  $('#loginForm').addEventListener('submit', event => { event.preventDefault(); applyUser($('#loginUser').value); openApp(); });
  $('#logoutButton').addEventListener('click', () => { $('#appView').hidden = true; $('#loginView').hidden = false; });
  $('#mobileMenu').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#mobileScrim').hidden = false; });
  $('#mobileScrim').addEventListener('click', () => { $('#sidebar').classList.remove('open'); $('#mobileScrim').hidden = true; });
  $$('[data-screen]').forEach(button => button.addEventListener('click', () => goTo(button.dataset.screen)));
  $('#patientToggle').addEventListener('click', () => { $('#patientOptions').hidden = !$('#patientOptions').hidden; });
  $('#patientSearch').addEventListener('input', event => { const term = event.target.value.toLowerCase(); $$('#patientOptions button').forEach(button => { button.hidden = !button.dataset.patient.toLowerCase().includes(term); }); $('#patientOptions').hidden = false; });
  $('#startTraining').addEventListener('click', () => { $('#trainingPatient').textContent = `Paciente: ${$('#patientSearch').value || 'Valeria Mendoza'}`; goTo('training'); });
  $('#finishTraining').addEventListener('click', () => { if (simTimer) { window.clearInterval(simTimer); simTimer = null; } $('#metricSessions').textContent = '16'; goTo('home'); showToast('Sesión simulada finalizada.'); });
  $('#newPatient').addEventListener('click', () => showToast('En esta versión estática el registro es demostrativo.'));
  $('#profileUpload').addEventListener('change', event => loadPhoto(event.target.files[0]));
  $('#removePhoto').addEventListener('click', () => { localStorage.removeItem(`vanbreast-photo-${currentKey}`); avatarElement($('#sideAvatar'), currentUser); avatarElement($('#settingsAvatar'), currentUser); renderInstructors(); showToast('Foto eliminada.'); });
  $$('.theme-option').forEach(button => button.addEventListener('click', () => { $$('.theme-option').forEach(item => item.classList.remove('active')); button.classList.add('active'); document.documentElement.dataset.theme = button.dataset.theme; if (button.dataset.theme === 'blue') { document.documentElement.style.setProperty('--pink', '#4b789f'); document.documentElement.style.setProperty('--pink-soft', '#dce9f5'); } else { document.documentElement.style.setProperty('--pink', '#be68aa'); document.documentElement.style.setProperty('--pink-soft', '#f0d0e9'); } }));
})();
