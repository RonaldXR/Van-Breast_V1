"use strict";

const gloveLabels = {
  connected: "Guante conectado",
  disconnected: "Guante desconectado",
  connecting: "Conectando…",
  error: "Error de conexión",
};

const participants = [];
const sessions = [];
const instructors = [];
const LIVE_CHART_MAX_POINTS = 720;

const demoAccounts = Object.freeze({
  clinical: {
    email: "vabanto@uch.edu.pe",
    password: "entrenamiento",
    name: "Vania Abanto",
    role: "Investigadora",
    initials: "VA",
  },
  admin: {
    email: "admin@vanbreast.local",
    password: "admin2026",
    name: "Administración",
    role: "Modo administrador",
    initials: "AD",
  },
});

const state = {
  gloveStatus: "connected",
  gloveTransport: "simulator",
  gloveSimulationAllowed: true,
  currentScreen: "home",
  loginMode: "clinical",
  userMode: "clinical",
  currentUser: null,
  csrfToken: "",
  selectedParticipant: "",
  editingParticipantId: null,
  activeSessionId: null,
  unfinishedSession: null,
  connectionLosses: 0,
  readingInFlight: false,
  checkpointInFlight: false,
  lastCheckpointSampleCount: 0,
  liveSampleCount: 0,
  checkpointMeasurements: [],
  instructorOffset: 0,
  elapsed: 84,
  activePoint: 5,
  transitioning: false,
  instructorCarouselTimer: null,
  sensorTimer: null,
  clockTimer: null,
  liveRenderFrame: null,
  pendingSensorPoint: null,
  realtimeSocket: null,
  pendingEvaluation: null,
  detailChartData: null,
  detailRangePercentage: 0,
  dashboardStats: {
    sessionsToday: 0,
    participants: 0,
    instructors: 0,
    weekly: [],
    weeklyTotal: 0,
  },
  chartData: [],
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const SCREEN_PATHS = {
  home: "#inicio",
  history: "#historial",
  people: "#participantes",
  settings: "#configuracion",
  training: "#entrenamiento",
};
const PATH_SCREENS = Object.fromEntries(
  Object.entries(SCREEN_PATHS).map(([screen, path]) => [path, screen]),
);

function hasUnfinishedSession() {
  return Boolean(state.activeSessionId || state.pendingEvaluation || state.unfinishedSession);
}

function initialScreenFromPage() {
  const declared = document.body.dataset.initialScreen;
  return PATH_SCREENS[window.location.hash] || declared || "home";
}

async function apiRequest(url, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (options.body && typeof options.body !== "string") {
    headers.set("Content-Type", "application/json");
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && state.csrfToken) {
    headers.set("X-CSRF-Token", state.csrfToken);
  }

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: "same-origin",
    body:
      options.body && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(data?.error || "No se pudo completar la operación.");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function replaceCollection(collection, values) {
  collection.splice(0, collection.length, ...(Array.isArray(values) ? values : []));
}

function renderApplicationData() {
  renderParticipants();
  renderRecentSessions();
  renderDashboardStats();
  populateHistoryFilters();
  renderHistory();
  $("#instructorCarousel").innerHTML = "";
  renderInstructors();
}

async function loadApplicationData() {
  const data = await apiRequest("/api/bootstrap");
  replaceCollection(participants, data.participants);
  replaceCollection(sessions, data.sessions);
  replaceCollection(instructors, data.instructors);
  state.dashboardStats = data.stats || state.dashboardStats;
  state.unfinishedSession = data.activeSession || null;
  state.gloveTransport = data.glove.transport || "simulator";
  state.gloveSimulationAllowed = Boolean(data.glove.simulationAllowed);
  setGloveStatus(data.glove.status);
  updateGloveControls();
  connectRealtime();
  renderApplicationData();
  return data;
}

function showOperationError(error) {
  window.alert(error?.message || "No se pudo completar la operación.");
}

function safe(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function parseDuration(duration) {
  const [minutes = 0, seconds = 0] = String(duration).split(":").map(Number);
  return minutes * 60 + seconds;
}

function normalizeSearch(value) {
  return String(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es");
}

function getThemeColor(variable, fallback) {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(variable).trim() ||
    fallback
  );
}

function applyTheme(theme, { persist = true } = {}) {
  const allowedThemes = ["pink", "blue", "admin"];
  const selectedTheme = allowedThemes.includes(theme) ? theme : "pink";
  document.documentElement.dataset.theme = selectedTheme;
  $$(".theme-option").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.themeOption === selectedTheme),
    );
  });

  if (persist && selectedTheme !== "admin") {
    try {
      window.localStorage.setItem("van-breast-theme", selectedTheme);
    } catch {
      // El prototipo sigue funcionando aunque el navegador bloquee el almacenamiento.
    }
  }

  requestAnimationFrame(() => {
    const themeColor = $("#themeColor");
    if (themeColor) themeColor.content = getThemeColor("--header-end", "#159a9d");
    if (state.currentScreen === "training") drawChart($("#liveChart"), state.chartData);
    if (state.currentScreen === "home") renderDashboardStats();
    if (!$("#detailBackdrop").hidden && state.detailChartData) {
      drawChart($("#detailChart"), state.detailChartData, true);
      drawRangeChart(state.detailRangePercentage);
    }
  });
}

function initializeTheme() {
  const clinicalThemes = ["pink", "blue"];
  let savedTheme = "pink";
  try {
    savedTheme = window.localStorage.getItem("van-breast-theme") || "pink";
  } catch {
    savedTheme = "pink";
  }
  if (!clinicalThemes.includes(savedTheme)) savedTheme = "pink";
  applyTheme(savedTheme, { persist: false });
}

function setLoginMode(mode, { populate = true } = {}) {
  const selectedMode = mode === "admin" ? "admin" : "clinical";
  const account = demoAccounts[selectedMode];
  state.loginMode = selectedMode;
  document.documentElement.dataset.loginMode = selectedMode;

  $$("[data-login-mode]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.loginMode === selectedMode),
    );
  });

  $("#loginSubtitle").textContent =
    selectedMode === "admin"
      ? "Accede a las herramientas administrativas del prototipo."
      : "Accede al panel de entrenamiento.";
  $("#loginAccessHint").textContent =
    selectedMode === "admin"
      ? "Demo local: admin@vanbreast.local · contraseña: admin2026"
      : "Demo local: vabanto@uch.edu.pe · contraseña: entrenamiento";
  $("#loginError").hidden = true;

  if (populate) {
    $("#email").value = account.email;
    $("#password").value = account.password;
  }
}

function setUserMode(mode, user = null) {
  const selectedMode = mode === "admin" ? "admin" : "clinical";
  const account = user || state.currentUser || demoAccounts[selectedMode];
  const isAdmin = selectedMode === "admin";
  state.userMode = selectedMode;
  state.currentUser = user || state.currentUser;
  document.documentElement.dataset.userMode = selectedMode;

  $("#profileAvatar").textContent = account.initials;
  $("#profileName").textContent = account.name;
  $("#profileRole").textContent = account.roleLabel || account.role;
  $("#themeOptions").hidden = isAdmin;
  $("#adminThemeLock").hidden = !isAdmin;
  $("#clearHistoryButton").hidden = !isAdmin;
  $("#adminParticipantManager").hidden = !isAdmin;
  $("#instructorOverview").hidden = isAdmin;
  $("#instructorFocus").hidden = true;
  $("#participantInstructorField").hidden = !isAdmin;
  $("#newInstructor").required = isAdmin;
  const homeNavigation = $('.sidebar nav button[data-screen="home"]');
  if (homeNavigation) homeNavigation.hidden = isAdmin;

  if (isAdmin) {
    applyTheme("admin", { persist: false });
  } else {
    initializeTheme();
  }
}

function formatSessionDate(dateISO) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateISO}T12:00:00`));
}

function updateClock() {
  const formatter = new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  $("#headerClock").textContent = formatter
    .format(new Date())
    .toUpperCase()
    .replace(",", " ·");
}

function updateGloveUI() {
  $$(".js-glove-badge").forEach((badge) => {
    badge.classList.remove(
      "glove-badge--connected",
      "glove-badge--disconnected",
      "glove-badge--connecting",
      "glove-badge--error",
    );
    badge.classList.add(`glove-badge--${state.gloveStatus}`);
    $(".js-glove-label", badge).textContent = gloveLabels[state.gloveStatus];
  });

  $$("#statusOptions button").forEach((button) => {
    button.classList.toggle("active", button.dataset.status === state.gloveStatus);
  });

  const ready = state.gloveStatus === "connected" && Boolean(state.selectedParticipant);
  $("#startTraining").disabled = !ready;
  const startHint = $("#startHint");
  if (startHint) {
    const messages = {
      connected: "Selecciona una participante para continuar.",
      disconnected: "Conecta el guante para iniciar el entrenamiento.",
      connecting: "Espera mientras el guante termina de conectarse.",
      error: "Revisa la conexión del guante antes de continuar.",
    };
    startHint.textContent = messages[state.gloveStatus];
    startHint.hidden = ready;
  }
  $("#connectionAlert").hidden =
    state.gloveStatus === "connected" || state.currentScreen !== "training";
}

function setGloveStatus(status) {
  if (!Object.hasOwn(gloveLabels, status)) return;
  const previousStatus = state.gloveStatus;
  state.gloveStatus = status;
  if (
    state.currentScreen === "training" &&
    previousStatus === "connected" &&
    status !== "connected"
  ) {
    state.connectionLosses += 1;
  }
  updateGloveUI();
}

function updateGloveControls() {
  const simulationVisible =
    state.gloveTransport === "simulator" && state.gloveSimulationAllowed;
  $("#cycleStatus").hidden = !simulationVisible;
  $("#statusOptions").hidden = !simulationVisible;
}

function disconnectRealtime() {
  state.realtimeSocket = null;
}

function connectRealtime() {
  // La demostración estática usa únicamente el simulador local.
}

async function requestGloveStatus(status) {
  try {
    const data = await apiRequest("/api/glove/status", {
      method: "PUT",
      body: { status },
    });
    setGloveStatus(data.status);
  } catch (error) {
    showOperationError(error);
  }
}

async function refreshGloveStatus() {
  try {
    const data = await apiRequest("/api/glove/status");
    state.gloveTransport = data.transport || state.gloveTransport;
    state.gloveSimulationAllowed = Boolean(data.simulationAllowed);
    setGloveStatus(data.status);
    updateGloveControls();
    connectRealtime();
  } catch {
    setGloveStatus("error");
  }
}

async function cycleGloveStatus() {
  const order = ["connected", "disconnected", "connecting", "error"];
  const next = (order.indexOf(state.gloveStatus) + 1) % order.length;
  await requestGloveStatus(order[next]);
}

function navigate(screen, { force = false, historyMode = "push" } = {}) {
  if (
    state.currentUser &&
    state.userMode === "admin" &&
    !["history", "people", "settings"].includes(screen)
  ) {
    screen = "settings";
  }
  if (
    !force &&
    hasUnfinishedSession() &&
    screen !== "training"
  ) {
    window.alert("Finaliza y guarda el entrenamiento antes de salir de esta pantalla.");
    return false;
  }

  const previousScreen = state.currentScreen;
  state.currentScreen = screen;
  $("#appShell").classList.toggle("training-mode", screen === "training");
  $$(".screen").forEach((section) => {
    section.hidden = section.id !== `screen-${screen}`;
  });
  $$(".sidebar nav button[data-screen]").forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === screen);
  });
  $("#sidebar").classList.remove("sidebar--open");
  $("#mobileScrim").hidden = true;
  if (screen !== "training") stopSensors();
  if (screen === "home") {
    requestAnimationFrame(renderDashboardStats);
  }
  if (screen === "training") {
    requestAnimationFrame(() => drawChart($("#liveChart"), state.chartData));
  }
  if (screen === "history") renderHistory();
  if (screen === "people") {
    if (state.userMode === "admin") {
      renderAdminParticipants();
    } else {
      renderInstructors();
      if (!$("#instructorOverview").hidden) startInstructorAutoplay();
    }
  } else {
    stopInstructorAutoplay();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  const targetPath = SCREEN_PATHS[screen];
  if (targetPath && historyMode !== "none" && window.location.pathname !== targetPath) {
    const method = historyMode === "replace" ? "replaceState" : "pushState";
    window.history[method]({ screen }, "", targetPath);
  } else if (
    targetPath &&
    historyMode === "replace" &&
    previousScreen === screen
  ) {
    window.history.replaceState({ screen }, "", targetPath);
  }
  return true;
}

function participantLabel(participant) {
  return `${participant.code} · ${participant.name} ${participant.lastName}`;
}

function setParticipantOptionsOpen(open) {
  const combobox = $("#participantCombobox");
  const input = $("#participantSearch");
  const toggle = $("#participantToggle");
  const options = $("#participantOptions");
  combobox.classList.toggle("is-open", open);
  input.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-expanded", String(open));
  options.hidden = !open;
}

function renderParticipantOptions(query = "") {
  const options = $("#participantOptions");
  const normalizedQuery = normalizeSearch(query.trim());
  const matches = participants.filter((participant) =>
    normalizeSearch(participantLabel(participant)).includes(normalizedQuery),
  );

  if (!matches.length) {
    options.innerHTML = '<span class="participant-options__empty">No hay coincidencias</span>';
    setParticipantOptionsOpen(true);
    return;
  }

  options.innerHTML = matches
    .map(
      (participant) =>
        `<button
          class="participant-option"
          type="button"
          role="option"
          aria-selected="${participant.code === state.selectedParticipant}"
          data-participant-code="${safe(participant.code)}"
        >
          <span class="participant-option__code">${safe(participant.code)}</span>
          <span>${safe(`${participant.name} ${participant.lastName}`)}</span>
        </button>`,
    )
    .join("");
  setParticipantOptionsOpen(true);
}

function selectParticipant(code) {
  const participant = participants.find((item) => item.code === code);
  if (!participant) return;
  state.selectedParticipant = participant.code;
  $("#participantSearch").value = participantLabel(participant);
  setParticipantOptionsOpen(false);
  updateGloveUI();
}

function renderParticipants() {
  const selected = participants.find((participant) => participant.code === state.selectedParticipant);
  $("#participantSearch").value = selected ? participantLabel(selected) : "";
  $("#participantOptions").innerHTML = "";
  setParticipantOptionsOpen(false);
  const displayedTotal = participants.length;
  $("#participantMetric").textContent = String(displayedTotal);
  $("#participantCount").textContent = String(displayedTotal);
  renderAdminParticipants();
  updateGloveUI();
}

function participantInstructorName(participant) {
  return (
    instructors.find((instructor) => instructor.id === participant.instructorId)?.name ||
    "Sin asignar"
  );
}

function renderAdminParticipants() {
  const list = $("#adminParticipantList");
  if (!list) return;
  const input = $("#adminParticipantSearch");
  const query = normalizeSearch(input?.value.trim() || "");
  const filtered = participants.filter((participant) => {
    const searchable = [
      participant.code,
      participant.name,
      participant.lastName,
      participant.dni,
      participant.email,
      participantInstructorName(participant),
    ].join(" ");
    return normalizeSearch(searchable).includes(query);
  });

  list.innerHTML = filtered.length
    ? filtered
        .map(
          (participant) => `
            <article class="participant-admin-row">
              <strong>${safe(participant.code)}</strong>
              <span class="participant-admin-person">
                <strong>${safe(`${participant.name} ${participant.lastName}`)}</strong>
                <small>DNI ${safe(participant.dni)}</small>
              </span>
              <span class="participant-admin-contact">
                <span>${safe(participant.email)}</span>
                <small>${safe(participant.phone || "Sin celular registrado")}</small>
              </span>
              <span>${safe(participantInstructorName(participant))}</span>
              <span class="participant-admin-actions">
                <button class="participant-edit" type="button" data-participant-id="${safe(participant.id)}">Editar</button>
                <button class="participant-delete" type="button" data-participant-id="${safe(participant.id)}">Eliminar</button>
              </span>
            </article>`,
        )
        .join("")
    : `
        <div class="participant-admin-empty">
          <strong>No se encontraron participantes</strong>
          <span>Prueba con otro nombre, DNI o correo.</span>
        </div>`;
}

function renderRecentSessions() {
  $("#recentSessions").innerHTML = sessions
    .slice(0, 4)
    .map(
      (session) => `
        <div class="activity-row">
          <time>${safe(session.date.split(" · ")[0])}</time>
          <div><strong>${safe(session.participant)}</strong><small>${safe(session.instructor)}</small></div>
          <span>${safe(session.duration)}</span>
          <span class="range-value">${session.inRange}% correcta</span>
        </div>`,
    )
    .join("");
}

function renderDashboardStats() {
  const stats = state.dashboardStats || {};
  $("#sessionsTodayMetric").textContent = String(stats.sessionsToday ?? 0).padStart(2, "0");
  $("#participantMetric").textContent = String(stats.participants ?? participants.length);
  $("#instructorMetric").textContent = String(stats.instructors ?? instructors.length);

  const weekly = Array.isArray(stats.weekly) ? stats.weekly : [];
  if (weekly.length) {
    window.VanBreastCharts.renderWeekly($("#weeklyChart"), weekly);
  }
  const weeklyTotal = Number(stats.weeklyTotal) || 0;
  $("#weeklyTotal").textContent =
    `${weeklyTotal} ${weeklyTotal === 1 ? "práctica" : "prácticas"}`;
}

function populateHistoryFilters() {
  const instructorNames = [...new Set(sessions.map((session) => session.instructor))];
  $("#historyInstructor").innerHTML =
    '<option value="all">Todos los instructores</option>' +
    instructorNames.map((name) => `<option value="${safe(name)}">${safe(name)}</option>`).join("");
}

function renderHistory() {
  const participantQuery = normalizeSearch($("#historyParticipant").value.trim());
  const instructor = $("#historyInstructor").value;
  const date = $("#historyDate").value;
  const filtered = sessions.filter((session) => {
    const matchesParticipant =
      !participantQuery || normalizeSearch(session.participant).includes(participantQuery);
    const matchesInstructor = instructor === "all" || session.instructor === instructor;
    const matchesDate = !date || session.dateISO === date;
    return matchesParticipant && matchesInstructor && matchesDate;
  });

  $("#historyRecords").innerHTML = filtered.length
    ? filtered
        .map(
          (session) => `
            <article class="record-row">
              <strong class="record-code">${safe(session.participantCode)}</strong>
              <strong>${safe(session.participant)}</strong>
              <span>${safe(session.instructor)}</span>
              <span>${safe(session.duration)}</span>
              <time>${safe(session.date)}</time>
              <button class="detail-button" type="button" data-session-id="${session.id}">Detalles <span class="detail-chevron" aria-hidden="true"></span></button>
            </article>`,
        )
        .join("")
    : '<div class="empty-state"><strong>No se encontraron sesiones</strong><span>Prueba limpiando los filtros.</span></div>';

  $$(".detail-button", $("#historyRecords")).forEach((button) => {
    button.addEventListener("click", () => openSessionDetail(button.dataset.sessionId));
  });
}

function renderSessionDetail(session, { preview = false } = {}) {
  const recordNumber = session.recordNumber ?? session.id;
  $("#detailRecord").textContent = preview
    ? `REGISTRO #${String(recordNumber).padStart(3, "0")} · VISTA PREVIA`
    : `REGISTRO #${String(recordNumber).padStart(3, "0")}`;
  $("#detailTitle").textContent = preview
    ? "Resultados de la evaluación"
    : "Detalle de sesión";
  $("#detailParticipant").textContent = session.participant;
  $("#detailInstructor").textContent = session.instructor;
  $("#detailDuration").textContent = `${session.duration} min`;
  $("#detailDate").textContent = formatSessionDate(session.dateISO);
  const totalSeconds = parseDuration(session.duration);
  const correctSeconds =
    session.correctSeconds ?? Math.round((totalSeconds * session.inRange) / 100);
  const incorrectSeconds = session.incorrectSeconds ?? totalSeconds - correctSeconds;
  $("#detailRange").textContent = formatTime(correctSeconds);
  $("#insideRange").textContent = `${formatTime(correctSeconds)} min`;
  $("#outsideRange").textContent = `${formatTime(incorrectSeconds)} min`;
  state.detailRangePercentage = Number(session.inRange) || 0;
  const adequate =
    session.adequate ??
    (session.indexRating === "Presión adecuada" &&
      session.middleRating === "Presión adecuada" &&
      session.inRange >= 70);
  $("#indicatorList").innerHTML = `
    <div><dt>Resultado general</dt><dd>${adequate ? "Evaluación adecuada" : "Requiere refuerzo"}</dd></div>
    <div><dt>Promedio dedo índice</dt><dd>${safe(session.indexAverage || session.average)} · ${safe(session.indexRating || "Sin valoración")}</dd></div>
    <div><dt>Promedio dedo medio</dt><dd>${safe(session.middleAverage || session.average)} · ${safe(session.middleRating || "Sin valoración")}</dd></div>
    <div><dt>Tiempo con presión correcta</dt><dd>${formatTime(correctSeconds)} min</dd></div>
    <div><dt>Tiempo fuera del rango</dt><dd>${formatTime(incorrectSeconds)} min</dd></div>
    <div><dt>Presión máxima</dt><dd>${safe(session.maximum)}</dd></div>
    <div><dt>Presión mínima</dt><dd>${safe(session.minimum)}</dd></div>
    <div><dt>Pérdidas de conexión</dt><dd>${session.losses}</dd></div>`;

  $("#detailCloseButton").hidden = preview;
  $("#detailCloseAction").hidden = preview;
  $("#continueTraining").hidden = !preview;
  $("#saveEvaluation").hidden = !preview;
  $("#detailFooterNote").textContent = preview
    ? "Estos son los datos que se guardarán en el historial."
    : "Registro guardado en la base de datos local.";
  $("#detailBackdrop").hidden = false;
  $(".detail-scroll").scrollTop = 0;
  const detailData =
    session.chartData ||
    Array.from({ length: 40 }, (_, index) => ({
      index: 10.5 + Math.sin(index / 3) * 2.1 + (index % 7) * 0.08,
      middle: 8.8 + Math.cos(index / 4.2) * 1.7,
    }));
  state.detailChartData = detailData;
  requestAnimationFrame(() => {
    drawChart($("#detailChart"), detailData, true);
    drawRangeChart(state.detailRangePercentage);
  });
}

async function openSessionDetail(sessionId) {
  try {
    const session = await apiRequest(`/api/sessions/${sessionId}`);
    const existingIndex = sessions.findIndex((item) => item.id === sessionId);
    if (existingIndex >= 0) sessions[existingIndex] = session;
    renderSessionDetail(session);
  } catch (error) {
    showOperationError(error);
  }
}

function closeSessionDetail() {
  if (state.pendingEvaluation) return;
  $("#detailBackdrop").hidden = true;
  state.detailChartData = null;
  state.detailRangePercentage = 0;
  window.VanBreastCharts.destroy("detail");
  window.VanBreastCharts.destroy("range");
}

function renderInstructors() {
  const lastOffset = Math.max(0, instructors.length - 4);
  state.instructorOffset = Math.min(Math.max(state.instructorOffset, 0), lastOffset);
  const carousel = $("#instructorCarousel");
  let track = $(".instructor-track", carousel);

  if (!track) {
    carousel.innerHTML = `
      <div class="instructor-track">
        ${instructors
          .map(
            (instructor, realIndex) => `
              <button class="instructor-card" type="button" data-instructor-index="${realIndex}">
                <span class="card-number">${String(realIndex + 1).padStart(2, "0")}</span>
                <span class="large-avatar">${safe(instructor.initials)}</span>
                <span class="instructor-copy"><strong>${safe(instructor.name)}</strong><small>${safe(instructor.role)}</small></span>
                <span class="patient-count"><strong>${instructor.count}</strong><small>participantes atendidas</small></span>
                <span class="card-arrow">↗</span>
              </button>`,
          )
          .join("")}
      </div>`;
    track = $(".instructor-track", carousel);
    $$(".instructor-card", track).forEach((button) => {
      button.addEventListener("click", () => showInstructor(Number(button.dataset.instructorIndex)));
    });
  }

  $("#instructorTotal").textContent = String(instructors.length);
  $("#instructorMetric").textContent = String(instructors.length);
  $("#carouselCounter").textContent =
    `${String(state.instructorOffset + 1).padStart(2, "0")} — ` +
    `${String(Math.min(state.instructorOffset + 4, instructors.length)).padStart(2, "0")} / ${String(instructors.length).padStart(2, "0")}`;
  window.requestAnimationFrame(positionInstructorTrack);
}

function positionInstructorTrack() {
  const track = $(".instructor-track", $("#instructorCarousel"));
  if (!track) return;
  const firstCard = $(".instructor-card", track);
  if (!firstCard) return;
  const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 12;
  const distance = state.instructorOffset * (firstCard.getBoundingClientRect().width + gap);
  track.style.transform = `translate3d(${-distance}px, 0, 0)`;
}

function shiftInstructors(direction) {
  const lastOffset = Math.max(0, instructors.length - 4);
  if (direction > 0) {
    state.instructorOffset = state.instructorOffset >= lastOffset ? 0 : state.instructorOffset + 1;
  } else {
    state.instructorOffset = state.instructorOffset <= 0 ? lastOffset : state.instructorOffset - 1;
  }
  renderInstructors();
}

function stopInstructorAutoplay() {
  if (state.instructorCarouselTimer) window.clearInterval(state.instructorCarouselTimer);
  state.instructorCarouselTimer = null;
}

function startInstructorAutoplay() {
  stopInstructorAutoplay();
  if (state.currentScreen !== "people" || $("#instructorOverview").hidden) return;
  state.instructorCarouselTimer = window.setInterval(() => shiftInstructors(1), 4200);
}

function showInstructor(index) {
  const instructor = instructors[index];
  if (!instructor) return;
  stopInstructorAutoplay();
  $("#instructorOverview").hidden = true;
  $("#instructorFocus").hidden = false;
  $("#focusEyebrow").textContent = `RED DE ATENCIÓN · ${instructor.count} PARTICIPANTES`;
  $("#focusName").textContent = instructor.name;
  $("#focusRole").textContent = instructor.role;
  $("#focusPatientCount").textContent = String(instructor.count);
  const totalPatients = instructor.patients.length;
  $("#patientTree").innerHTML = `
    <div class="mind-map">
      <div class="mind-map__arc mind-map__arc--outer" aria-hidden="true"></div>
      <div class="mind-map__arc mind-map__arc--inner" aria-hidden="true"></div>
      <div class="tree-root">
        <span class="large-avatar">${safe(instructor.initials)}</span>
        <strong>${safe(instructor.name)}</strong><small>INSTRUCTOR</small>
      </div>
      <div class="tree-branches">
        ${instructor.patients
          .map((patient, patientIndex) => {
            const angle = totalPatients === 1
              ? 270
              : 200 + (140 * patientIndex) / (totalPatients - 1);
            const radians = (angle * Math.PI) / 180;
            const x = 50 + Math.cos(radians) * 40;
            const y = 66 + Math.sin(radians) * 45;
            return `
            <button class="patient-node" type="button" style="--node-x:${x.toFixed(2)}%; --node-y:${y.toFixed(2)}%">
              <span>${String(patientIndex + 1).padStart(2, "0")}</span>
              <strong>${safe(patient)}</strong>
              <small>${2 + (patientIndex % 4)} sesiones</small>
            </button>`;
          })
          .join("")}
      </div>
    </div>`;
}

function returnToInstructors() {
  $("#instructorOverview").hidden = false;
  $("#instructorFocus").hidden = true;
  renderInstructors();
  startInstructorAutoplay();
}

function populateParticipantInstructorOptions(selectedId = "") {
  const select = $("#newInstructor");
  select.innerHTML = instructors
    .map(
      (instructor) =>
        `<option value="${safe(instructor.id)}">${safe(instructor.name)}</option>`,
    )
    .join("");
  select.value =
    selectedId && instructors.some((instructor) => instructor.id === selectedId)
      ? selectedId
      : instructors[0]?.id || "";
}

function openParticipantModal(participant = null) {
  const editingParticipant =
    participant && typeof participant === "object" && "id" in participant
      ? participant
      : null;
  $("#participantForm").reset();
  state.editingParticipantId = editingParticipant?.id || null;
  const isEditing = Boolean(editingParticipant);
  const isAdmin = state.userMode === "admin";

  $("#participantModalEyebrow").textContent = isEditing
    ? "EDITAR REGISTRO"
    : "NUEVO REGISTRO";
  $("#participantTitle").textContent = isEditing
    ? "Editar participante"
    : "Registrar participante";
  $("#participantSubmit").textContent = isEditing
    ? "Guardar cambios"
    : "Guardar participante";
  $("#newCode").value = editingParticipant?.code || "Asignación automática";
  $("#participantInstructorField").hidden = !isAdmin;
  $("#newInstructor").required = isAdmin;
  populateParticipantInstructorOptions(editingParticipant?.instructorId || "");

  if (editingParticipant) {
    $("#newName").value = editingParticipant.name;
    $("#newLastName").value = editingParticipant.lastName;
    $("#newDni").value = editingParticipant.dni;
    $("#newBirthDate").value = editingParticipant.birthDate;
    $("#newEmail").value = editingParticipant.email;
    $("#newPhone").value = editingParticipant.phone || "";
    $("#newObservations").value = editingParticipant.observations || "";
  }

  $("#participantBackdrop").hidden = false;
  window.setTimeout(() => $("#newName").focus(), 0);
}

function closeParticipantModal() {
  $("#participantBackdrop").hidden = true;
  state.editingParticipantId = null;
}

async function saveParticipant(event) {
  event.preventDefault();
  const submitButton = $("#participantForm button[type='submit']");
  submitButton.disabled = true;
  try {
    const editingId = state.editingParticipantId;
    const payload = {
      name: $("#newName").value.trim(),
      lastName: $("#newLastName").value.trim(),
      dni: $("#newDni").value.trim(),
      birthDate: $("#newBirthDate").value,
      email: $("#newEmail").value.trim(),
      phone: $("#newPhone").value.trim(),
      observations: $("#newObservations").value.trim(),
      ...(state.userMode === "admin"
        ? { instructorId: $("#newInstructor").value }
        : {}),
    };
    const participant = await apiRequest(
      editingId ? `/api/participants/${editingId}` : "/api/participants",
      {
        method: editingId ? "PUT" : "POST",
        body: payload,
      },
    );

    const existingIndex = participants.findIndex(
      (item) => item.id === participant.id,
    );
    if (existingIndex >= 0) {
      participants.splice(existingIndex, 1, participant);
    } else {
      participants.push(participant);
    }
    participants.sort((left, right) => left.code.localeCompare(right.code));
    if (state.userMode !== "admin") {
      state.selectedParticipant = participant.code;
    }
    state.dashboardStats.participants = participants.length;
    renderParticipants();
    renderDashboardStats();
    closeParticipantModal();
  } catch (error) {
    showOperationError(error);
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteParticipant(participantId) {
  const participant = participants.find((item) => item.id === participantId);
  if (!participant) return;
  const confirmed = window.confirm(
    `¿Eliminar a ${participant.name} ${participant.lastName}?\n\n` +
      "Si tiene sesiones registradas, se archivará y su historial se conservará.",
  );
  if (!confirmed) return;

  try {
    const result = await apiRequest(`/api/participants/${participantId}`, {
      method: "DELETE",
    });
    const index = participants.findIndex((item) => item.id === participantId);
    if (index >= 0) participants.splice(index, 1);
    if (state.selectedParticipant === participant.code) {
      state.selectedParticipant = "";
    }
    state.dashboardStats.participants = participants.length;
    renderParticipants();
    renderDashboardStats();
    window.alert(result.message);
  } catch (error) {
    showOperationError(error);
  }
}

function updateTouchPoints() {
  $$(".touch-point").forEach((point, index) => {
    const number = index + 1;
    point.classList.toggle("done", number < state.activePoint);
    point.classList.toggle("current", number === state.activePoint);
  });
  $("#activePointLabel").textContent = String(state.activePoint);
}

function updateSensorReading(name, pressure, min, max) {
  $(`#${name}Pressure`).textContent = pressure.toFixed(1);
  $(`#${name}Gauge`).style.height = `${Math.min(92, (pressure / 16) * 100)}%`;
  const verdict = $(`#${name}Verdict`);
  const correct = pressure >= min && pressure <= max;
  verdict.classList.toggle("correct", correct);
  verdict.classList.toggle("incorrect", !correct);
  verdict.innerHTML = `<i></i> ${correct ? "Presión correcta" : "Ajustar presión"}`;
}

function downsamplePressureData(data, maximumPoints = LIVE_CHART_MAX_POINTS) {
  if (!Array.isArray(data) || data.length <= maximumPoints) return data || [];

  const result = [data[0]];
  const bucketCount = Math.max(1, Math.floor((maximumPoints - 2) / 4));
  const bucketSize = (data.length - 2) / bucketCount;

  for (let bucket = 0; bucket < bucketCount; bucket += 1) {
    const start = 1 + Math.floor(bucket * bucketSize);
    const end = Math.min(
      data.length - 1,
      1 + Math.floor((bucket + 1) * bucketSize),
    );
    if (start >= end) continue;

    let minIndex = start;
    let maxIndex = start;
    let minMiddle = start;
    let maxMiddle = start;
    for (let index = start + 1; index < end; index += 1) {
      if (Number(data[index].index) < Number(data[minIndex].index)) minIndex = index;
      if (Number(data[index].index) > Number(data[maxIndex].index)) maxIndex = index;
      if (Number(data[index].middle) < Number(data[minMiddle].middle)) minMiddle = index;
      if (Number(data[index].middle) > Number(data[maxMiddle].middle)) maxMiddle = index;
    }

    [...new Set([minIndex, maxIndex, minMiddle, maxMiddle])]
      .sort((left, right) => left - right)
      .forEach((index) => result.push(data[index]));
  }

  result.push(data.at(-1));
  return result;
}

function drawChart(canvas, data, compact = false) {
  if (!canvas) return;
  const maximumPoints = compact ? 900 : LIVE_CHART_MAX_POINTS;
  window.VanBreastCharts.renderPressure(
    canvas.id,
    canvas,
    downsamplePressureData(data, maximumPoints),
    { compact },
  );
}

function drawRangeChart(percentage) {
  window.VanBreastCharts.renderRange($("#detailRangeChart"), percentage);
}

function renderPendingSensorReading() {
  state.liveRenderFrame = null;
  const point = state.pendingSensorPoint;
  state.pendingSensorPoint = null;
  if (!point || state.currentScreen !== "training") return;

  state.activePoint = point.zone;
  $("#sessionClock").textContent = formatTime(state.elapsed);
  updateSensorReading("index", point.index, 9.5, 13.5);
  updateSensorReading("middle", point.middle, 8.5, 12.5);
  updateTouchPoints();
  drawChart($("#liveChart"), state.chartData);
}

function scheduleLiveSensorRender() {
  if (state.liveRenderFrame !== null) return;
  state.liveRenderFrame = window.requestAnimationFrame(renderPendingSensorReading);
}

function applySensorReading(reading) {
  if (
    state.currentScreen !== "training" ||
    !state.activeSessionId
  ) {
    return;
  }

  const point = {
    index: Number(reading.index),
    middle: Number(reading.middle),
    zone: Number(reading.zone),
    elapsedMs: Number(reading.elapsedMs ?? state.elapsed * 1000),
  };
  if (
    !Number.isFinite(point.index) ||
    !Number.isFinite(point.middle) ||
    !Number.isInteger(point.zone) ||
    point.zone < 1 ||
    point.zone > 8
  ) {
    return;
  }

  state.chartData.push(point);
  state.liveSampleCount += 1;
  if (state.gloveTransport === "simulator") {
    state.checkpointMeasurements.push(point);
  }
  state.elapsed = Math.max(
    state.elapsed,
    Math.floor(Math.max(0, point.elapsedMs) / 1000),
  );
  state.pendingSensorPoint = point;
  scheduleLiveSensorRender();

  if (
    state.gloveTransport === "simulator" &&
    state.checkpointMeasurements.length >= 8
  ) {
    void checkpointActiveSession();
  }
}

async function updateSensors() {
  if (
    state.gloveTransport !== "simulator" ||
    state.gloveStatus !== "connected" ||
    state.currentScreen !== "training" ||
    state.readingInFlight
  ) {
    return;
  }
  state.readingInFlight = true;
  try {
    const reading = await apiRequest("/api/glove/reading");
    applySensorReading({
      ...reading,
      elapsedMs: state.elapsed * 1000,
    });
  } catch (error) {
    if (error.data?.status) setGloveStatus(error.data.status);
  } finally {
    state.readingInFlight = false;
  }
}

async function checkpointActiveSession({ force = false } = {}) {
  if (
    !state.activeSessionId ||
    state.pendingEvaluation ||
    state.checkpointInFlight ||
    (
      !force &&
      (
        state.gloveTransport === "simulator"
          ? state.checkpointMeasurements.length === 0
          : state.liveSampleCount === state.lastCheckpointSampleCount
      )
    )
  ) {
    return;
  }

  state.checkpointInFlight = true;
  try {
    const pendingMeasurements =
      state.gloveTransport === "simulator"
        ? [...state.checkpointMeasurements]
        : [];
    const measurementOffset =
      state.liveSampleCount - pendingMeasurements.length;
    await apiRequest(`/api/sessions/${state.activeSessionId}/checkpoint`, {
      method: "PUT",
      keepalive: force,
      body: {
        elapsedSeconds: state.elapsed,
        connectionLosses: state.connectionLosses,
        ...(state.gloveTransport === "simulator"
          ? {
              measurementOffset,
              measurements: pendingMeasurements,
            }
          : {}),
      },
    });
    if (state.gloveTransport === "simulator") {
      state.checkpointMeasurements.splice(0, pendingMeasurements.length);
      state.lastCheckpointSampleCount =
        state.liveSampleCount - state.checkpointMeasurements.length;
    } else {
      state.lastCheckpointSampleCount = state.liveSampleCount;
    }
  } catch (error) {
    if (error.status === 409) {
      await recoverCurrentSession();
    }
  } finally {
    state.checkpointInFlight = false;
  }
}

function startSensors() {
  stopSensors();
  if (state.gloveTransport === "simulator") {
    state.sensorTimer = window.setInterval(updateSensors, 650);
  }
  state.clockTimer = window.setInterval(() => {
    if (state.gloveStatus === "connected" && state.currentScreen === "training") {
      state.elapsed += 1;
      $("#sessionClock").textContent = formatTime(state.elapsed);
    }
  }, 1000);
  if (state.gloveTransport === "simulator") {
    updateSensors();
  }
}

function stopSensors() {
  if (state.sensorTimer) window.clearInterval(state.sensorTimer);
  if (state.clockTimer) window.clearInterval(state.clockTimer);
  if (state.liveRenderFrame !== null) window.cancelAnimationFrame(state.liveRenderFrame);
  state.sensorTimer = null;
  state.clockTimer = null;
  state.liveRenderFrame = null;
  if (state.pendingSensorPoint) renderPendingSensorReading();
}

function playDashboardTransition({ title, onClosed, onComplete }) {
  if (state.transitioning) return false;
  state.transitioning = true;

  const intro = $("#vaultIntro");
  $("#transitionTitle").textContent = title;
  intro.setAttribute("aria-label", title);
  intro.hidden = false;
  intro.classList.remove("is-active");
  void intro.offsetWidth;
  intro.classList.add("is-active");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const closedDelay = reducedMotion ? 0 : 900;
  const completeDelay = reducedMotion ? 20 : 2800;

  window.setTimeout(() => {
    if (typeof onClosed === "function") onClosed();
  }, closedDelay);

  window.setTimeout(() => {
    intro.hidden = true;
    intro.classList.remove("is-active");
    state.transitioning = false;
    if (typeof onComplete === "function") onComplete();
  }, completeDelay);

  return true;
}

async function startTraining() {
  if (state.gloveStatus !== "connected") return;
  const participant = participants.find((item) => item.code === state.selectedParticipant);
  if (!participant) return;
  const startButton = $("#startTraining");
  startButton.disabled = true;
  try {
    const session = await apiRequest("/api/sessions", {
      method: "POST",
      body: { participantCode: participant.code },
    });
    state.activeSessionId = session.id;
    state.unfinishedSession = {
      ...session,
      participantCode: participant.code,
      participant: `${participant.name} ${participant.lastName}`,
      status: "active",
    };
    state.connectionLosses = 0;
    state.chartData = [];
    state.lastCheckpointSampleCount = 0;
    state.liveSampleCount = 0;
    state.checkpointMeasurements = [];
    state.pendingSensorPoint = null;
    $("#trainingParticipant").textContent = `${participant.name} ${participant.lastName}`;
    state.elapsed = 0;
    state.activePoint = 1;
    $("#sessionClock").textContent = formatTime(state.elapsed);
    updateTouchPoints();
    playDashboardTransition({
      title: "Iniciando entrenamiento",
      onClosed: () => navigate("training", { force: true }),
      onComplete: () => {
        startSensors();
        drawChart($("#liveChart"), state.chartData);
      },
    });
  } catch (error) {
    if (error.status === 409 && error.data?.sessionId) {
      await recoverCurrentSession();
    } else {
      showOperationError(error);
    }
  } finally {
    updateGloveUI();
  }
}

function restoreUnfinishedSession(session) {
  if (!session) return false;

  state.unfinishedSession = session;
  state.activeSessionId = session.id;
  state.selectedParticipant = session.participantCode;
  state.elapsed = Number(session.elapsedSeconds) || parseDuration(session.duration) || 0;
  state.connectionLosses = Number(session.losses) || 0;
  state.chartData = Array.isArray(session.chartData) ? [...session.chartData] : [];
  state.liveSampleCount = Number(session.sampleCount) || state.chartData.length;
  state.checkpointMeasurements = [];
  state.pendingSensorPoint = null;
  state.lastCheckpointSampleCount = state.liveSampleCount;
  state.pendingEvaluation = session.status === "draft" ? session : null;

  const participant = participants.find(
    (item) => item.code === session.participantCode,
  );
  if (participant) {
    $("#participantSearch").value = participantLabel(participant);
  }
  $("#trainingParticipant").textContent = session.participant;
  $("#sessionClock").textContent = formatTime(state.elapsed);

  const latest = state.chartData.at(-1);
  if (latest) {
    state.activePoint = Number(latest.zone) || 1;
    updateSensorReading("index", Number(latest.index), 9.5, 13.5);
    updateSensorReading("middle", Number(latest.middle), 8.5, 12.5);
  }
  updateTouchPoints();
  updateGloveUI();
  navigate("training", { force: true, historyMode: "replace" });

  if (session.status === "draft") {
    stopSensors();
    renderSessionDetail(session, { preview: true });
  } else {
    startSensors();
  }
  return true;
}

async function recoverCurrentSession() {
  const data = await apiRequest("/api/sessions/current");
  state.unfinishedSession = data.session || null;
  if (!data.session) {
    state.activeSessionId = null;
    state.pendingEvaluation = null;
    return false;
  }
  return restoreUnfinishedSession(data.session);
}

async function showEvaluationResults() {
  if (!state.activeSessionId) return;
  const session = await apiRequest(`/api/sessions/${state.activeSessionId}/finish`, {
    method: "POST",
    body: {
      durationSeconds: Math.max(state.elapsed, 1),
      connectionLosses: state.connectionLosses,
    },
  });
  state.pendingEvaluation = session;
  state.unfinishedSession = session;
  renderSessionDetail(session, { preview: true });
}

async function finishTraining() {
  const finishButton = $("#finishTraining");
  finishButton.disabled = true;
  stopSensors();
  try {
    await checkpointActiveSession({ force: true });
    await showEvaluationResults();
  } catch (error) {
    showOperationError(error);
    startSensors();
  } finally {
    finishButton.disabled = false;
  }
}

async function continueTraining() {
  if (!state.activeSessionId) return;
  try {
    await apiRequest(`/api/sessions/${state.activeSessionId}/resume`, {
      method: "POST",
    });
    $("#detailBackdrop").hidden = true;
    state.pendingEvaluation = null;
    state.unfinishedSession = {
      ...state.unfinishedSession,
      status: "active",
      elapsedSeconds: state.elapsed,
      chartData: state.chartData,
    };
    state.detailChartData = null;
    state.detailRangePercentage = 0;
    window.VanBreastCharts.destroy("detail");
    window.VanBreastCharts.destroy("range");
    startSensors();
  } catch (error) {
    showOperationError(error);
  }
}

async function saveEvaluationAndClose() {
  const session = state.pendingEvaluation;
  if (!session) return;
  const saveButton = $("#saveEvaluation");
  saveButton.disabled = true;
  try {
    const savedSession = await apiRequest(`/api/sessions/${session.id}/confirm`, {
      method: "POST",
    });
    sessions.unshift(savedSession);
    $("#detailBackdrop").hidden = true;
    state.pendingEvaluation = null;
    state.detailChartData = null;
    state.detailRangePercentage = 0;
    window.VanBreastCharts.destroy("detail");
    window.VanBreastCharts.destroy("range");
    state.activeSessionId = null;
    state.unfinishedSession = null;
    state.lastCheckpointSampleCount = 0;
    state.liveSampleCount = 0;
    state.checkpointMeasurements = [];
    state.selectedParticipant = "";
    state.dashboardStats.sessionsToday =
      (Number(state.dashboardStats.sessionsToday) || 0) + 1;
    state.dashboardStats.weeklyTotal =
      (Number(state.dashboardStats.weeklyTotal) || 0) + 1;
    const weeklyIndex = (new Date().getDay() + 6) % 7;
    if (state.dashboardStats.weekly?.[weeklyIndex]) {
      state.dashboardStats.weekly[weeklyIndex].count =
        (Number(state.dashboardStats.weekly[weeklyIndex].count) || 0) + 1;
    }
    renderParticipants();
    renderRecentSessions();
    renderDashboardStats();
    populateHistoryFilters();
    renderHistory();
    playDashboardTransition({
      title: "Finalizando entrenamiento",
      onClosed: () => navigate("home", { force: true, historyMode: "replace" }),
    });
  } catch (error) {
    showOperationError(error);
  } finally {
    saveButton.disabled = false;
  }
}

function exportSessions() {
  const header = [
    "Código",
    "Participante",
    "Instructora",
    "Duración",
    "Fecha",
    "Presión promedio",
    "Presión correcta",
  ];
  const rows = sessions.map((session) => [
    session.participantCode,
    session.participant,
    session.instructor,
    session.duration,
    session.date,
    session.average,
    `${session.inRange}%`,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "van-breast-sesiones.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

async function clearTestHistory() {
  const confirmed = window.confirm(
    "¿Eliminar todo el historial de pruebas?\n\n" +
      "Se borrarán definitivamente todas las sesiones, se reiniciará la " +
      "numeración y también se retirarán las participantes archivadas. " +
      "Esta acción no se puede deshacer.",
  );
  if (!confirmed) return;

  const button = $("#clearHistoryButton");
  button.disabled = true;
  try {
    const result = await apiRequest("/api/admin/history", {
      method: "DELETE",
      body: { confirmation: "ELIMINAR HISTORIAL" },
    });
    $("#historyParticipant").value = "";
    $("#historyInstructor").value = "all";
    $("#historyDate").value = "";
    await loadApplicationData();
    window.alert(
      `Historial limpio: ${result.deletedSessions} ` +
        `${result.deletedSessions === 1 ? "sesión eliminada" : "sesiones eliminadas"}. ` +
        "El próximo registro será el número 1.",
    );
  } catch (error) {
    showOperationError(error);
  } finally {
    button.disabled = false;
  }
}

function bindEvents() {
  $("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $("#email").value.trim().toLocaleLowerCase("es");
    const password = $("#password").value;
    const submitButton = $("#loginForm button[type='submit']");
    submitButton.disabled = true;
    $("#loginError").hidden = true;
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: {
          email,
          password,
          mode: state.loginMode,
        },
      });
      state.csrfToken = data.csrfToken;
      state.currentUser = data.user;
      setUserMode(data.user.role, data.user);
      await loadApplicationData();
      $("#loginPage").hidden = true;
      $("#appShell").hidden = false;
      if (!restoreUnfinishedSession(state.unfinishedSession)) {
        navigate(state.userMode === "admin" ? "settings" : "home", {
          force: true,
          historyMode: "replace",
        });
      }
    } catch (error) {
      $("#loginError").textContent = error.message;
      $("#loginError").hidden = false;
      $("#email").focus();
    } finally {
      submitButton.disabled = false;
    }
  });

  $$("[data-login-mode]").forEach((button) => {
    button.addEventListener("click", () => setLoginMode(button.dataset.loginMode));
  });
  $("#email").addEventListener("input", () => {
    $("#loginError").hidden = true;
  });
  $("#password").addEventListener("input", () => {
    $("#loginError").hidden = true;
  });

  $("#togglePassword").addEventListener("click", () => {
    const input = $("#password");
    input.type = input.type === "password" ? "text" : "password";
    $("#togglePassword").textContent = input.type === "password" ? "Ver" : "Ocultar";
  });

  $("#cycleStatus").addEventListener("click", cycleGloveStatus);
  const participantSearch = $("#participantSearch");
  participantSearch.addEventListener("input", (event) => {
    const exactMatch = participants.find(
      (participant) =>
        normalizeSearch(participantLabel(participant)) === normalizeSearch(event.target.value),
    );
    state.selectedParticipant = exactMatch?.code || "";
    renderParticipantOptions(event.target.value);
    updateGloveUI();
  });
  participantSearch.addEventListener("focus", () => {
    const selected = participants.find(
      (participant) => participant.code === state.selectedParticipant,
    );
    const query =
      selected && participantSearch.value === participantLabel(selected)
        ? ""
        : participantSearch.value;
    renderParticipantOptions(query);
  });
  participantSearch.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setParticipantOptionsOpen(false);
      return;
    }
    const firstOption = $(".participant-option", $("#participantOptions"));
    if (event.key === "ArrowDown" && firstOption) {
      event.preventDefault();
      firstOption.focus();
    }
    if (event.key === "Enter" && firstOption && !$("#participantOptions").hidden) {
      event.preventDefault();
      selectParticipant(firstOption.dataset.participantCode);
    }
  });
  $("#participantToggle").addEventListener("click", () => {
    const isOpen = !$("#participantOptions").hidden;
    if (isOpen) {
      setParticipantOptionsOpen(false);
      return;
    }
    const selected = participants.find(
      (participant) => participant.code === state.selectedParticipant,
    );
    const query =
      selected && participantSearch.value === participantLabel(selected)
        ? ""
        : participantSearch.value;
    renderParticipantOptions(query);
    participantSearch.focus();
  });
  $("#participantOptions").addEventListener("click", (event) => {
    const option = event.target.closest(".participant-option");
    if (option) selectParticipant(option.dataset.participantCode);
  });
  document.addEventListener("mousedown", (event) => {
    if (!event.target.closest("#participantCombobox")) setParticipantOptionsOpen(false);
  });
  $("#startTraining").addEventListener("click", startTraining);
  $("#finishTraining").addEventListener("click", finishTraining);
  $("#continueTraining").addEventListener("click", continueTraining);
  $("#saveEvaluation").addEventListener("click", saveEvaluationAndClose);
  $("#logoutButton").addEventListener("click", async () => {
    if (hasUnfinishedSession()) {
      window.alert("Finaliza y guarda el entrenamiento antes de cerrar sesión.");
      navigate("training", { force: true, historyMode: "replace" });
      return;
    }
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch (error) {
      if (error.status !== 401) {
        showOperationError(error);
        return;
      }
      // La interfaz también se cierra si la sesión del servidor ya expiró.
    }
    stopSensors();
    disconnectRealtime();
    state.csrfToken = "";
    state.currentUser = null;
    state.activeSessionId = null;
    state.unfinishedSession = null;
    state.pendingEvaluation = null;
    state.selectedParticipant = "";
    renderParticipants();
    navigate("home", { force: true, historyMode: "none" });
    $("#appShell").hidden = true;
    $("#loginPage").hidden = false;
    window.history.replaceState({}, "", "#");
    setUserMode("clinical");
    setLoginMode("clinical");
  });

  $$("[data-screen]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.screen));
  });

  $("#mobileMenu").addEventListener("click", () => {
    $("#sidebar").classList.toggle("sidebar--open");
    $("#mobileScrim").hidden = !$("#sidebar").classList.contains("sidebar--open");
  });
  $("#mobileScrim").addEventListener("click", () => {
    $("#sidebar").classList.remove("sidebar--open");
    $("#mobileScrim").hidden = true;
  });

  $$("#statusOptions button").forEach((button) => {
    button.addEventListener("click", () => requestGloveStatus(button.dataset.status));
  });
  $$(".theme-option").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.userMode !== "admin") applyTheme(button.dataset.themeOption);
    });
  });

  $("#historyParticipant").addEventListener("input", renderHistory);
  ["historyInstructor", "historyDate"].forEach((id) => {
    $(`#${id}`).addEventListener("change", renderHistory);
  });
  $("#clearFilters").addEventListener("click", () => {
    $("#historyParticipant").value = "";
    $("#historyInstructor").value = "all";
    $("#historyDate").value = "";
    renderHistory();
  });
  $("#exportButton").addEventListener("click", exportSessions);
  $("#clearHistoryButton").addEventListener("click", clearTestHistory);

  $("#previousInstructors").addEventListener("click", () => {
    shiftInstructors(-1);
    startInstructorAutoplay();
  });
  $("#nextInstructors").addEventListener("click", () => {
    shiftInstructors(1);
    startInstructorAutoplay();
  });
  $("#instructorCarousel").addEventListener("mouseenter", stopInstructorAutoplay);
  $("#instructorCarousel").addEventListener("mouseleave", startInstructorAutoplay);
  $("#instructorCarousel").addEventListener("focusin", stopInstructorAutoplay);
  $("#instructorCarousel").addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!$("#instructorCarousel").contains(document.activeElement)) startInstructorAutoplay();
    }, 0);
  });
  $("#backToInstructors").addEventListener("click", returnToInstructors);

  $$(".js-open-participant").forEach((button) =>
    button.addEventListener("click", openParticipantModal),
  );
  $("#adminParticipantSearch").addEventListener("input", renderAdminParticipants);
  $("#adminParticipantList").addEventListener("click", (event) => {
    const editButton = event.target.closest(".participant-edit");
    if (editButton) {
      const participant = participants.find(
        (item) => item.id === editButton.dataset.participantId,
      );
      if (participant) openParticipantModal(participant);
      return;
    }
    const deleteButton = event.target.closest(".participant-delete");
    if (deleteButton) {
      void deleteParticipant(deleteButton.dataset.participantId);
    }
  });
  $$(".js-close-participant").forEach((button) =>
    button.addEventListener("click", closeParticipantModal),
  );
  $("#participantForm").addEventListener("submit", saveParticipant);
  $$(".js-close-detail").forEach((button) =>
    button.addEventListener("click", closeSessionDetail),
  );

  $("#participantBackdrop").addEventListener("mousedown", (event) => {
    if (event.target === event.currentTarget) closeParticipantModal();
  });
  $("#detailBackdrop").addEventListener("mousedown", (event) => {
    if (event.target === event.currentTarget) closeSessionDetail();
  });

  $$(".touch-point").forEach((point, index) => {
    point.addEventListener("click", () => {
      state.activePoint = index + 1;
      updateTouchPoints();
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeParticipantModal();
    closeSessionDetail();
    $("#sidebar").classList.remove("sidebar--open");
    $("#mobileScrim").hidden = true;
  });

  window.addEventListener("resize", () => {
    if (state.currentScreen === "training") drawChart($("#liveChart"), state.chartData);
    if (state.currentScreen === "people") positionInstructorTrack();
  });

  window.addEventListener("beforeunload", (event) => {
    if (!hasUnfinishedSession()) return;
    event.preventDefault();
    event.returnValue = "";
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && state.activeSessionId) {
      void checkpointActiveSession({ force: true });
    }
  });

  window.addEventListener("popstate", () => {
    if (!state.currentUser) return;
    const requestedScreen = PATH_SCREENS[window.location.hash];
    if (hasUnfinishedSession() && requestedScreen !== "training") {
      window.history.replaceState({ screen: "training" }, "", SCREEN_PATHS.training);
      navigate("training", { force: true, historyMode: "none" });
      window.alert("Finaliza y guarda el entrenamiento antes de salir de esta pantalla.");
      return;
    }

    const fallback = state.userMode === "admin" ? "settings" : "home";
    navigate(requestedScreen || fallback, {
      force: true,
      historyMode: requestedScreen ? "none" : "replace",
    });
  });
}

async function restoreAuthenticatedSession() {
  try {
    const data = await apiRequest("/api/auth/me");
    state.csrfToken = data.csrfToken;
    state.currentUser = data.user;
    setUserMode(data.user.role, data.user);
    await loadApplicationData();
    $("#loginPage").hidden = true;
    $("#appShell").hidden = false;
    if (restoreUnfinishedSession(state.unfinishedSession)) return;

    let requestedScreen = initialScreenFromPage();
    if (requestedScreen === "login" || requestedScreen === "training") {
      requestedScreen = data.user.role === "admin" ? "settings" : "home";
    }
    if (
      data.user.role === "admin" &&
      !["history", "people", "settings"].includes(requestedScreen)
    ) {
      requestedScreen = "settings";
    }
    navigate(requestedScreen, { force: true, historyMode: "replace" });
  } catch (error) {
    if (error.status !== 401) console.error(error);
  }
}

async function initialize() {
  initializeTheme();
  replaceCollection(participants, []);
  replaceCollection(sessions, []);
  replaceCollection(instructors, []);
  renderParticipants();
  renderRecentSessions();
  populateHistoryFilters();
  renderHistory();
  renderInstructors();
  updateGloveUI();
  updateClock();
  window.setInterval(updateClock, 1000);
  bindEvents();
  setLoginMode("clinical");
  await refreshGloveStatus();
  window.setInterval(refreshGloveStatus, 2500);
  await restoreAuthenticatedSession();
}

document.addEventListener("DOMContentLoaded", () => {
  initialize().catch((error) => {
    console.error(error);
    showOperationError(error);
  });
});
