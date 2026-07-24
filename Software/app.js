"use strict";

const gloveLabels = {
  connected: "Guante conectado",
  disconnected: "Guante desconectado",
  connecting: "Conectando…",
  error: "Error de conexión",
};

const participants = [
  {
    code: "P-001",
    name: "Fulana",
    lastName: "Quispe Rojas",
    dni: "73481920",
    birthDate: "1994-02-18",
    email: "fulana.quispe@correo.pe",
    phone: "987 410 224",
    observations: "",
  },
  {
    code: "P-002",
    name: "María",
    lastName: "Torres Salazar",
    dni: "70184263",
    birthDate: "1988-10-03",
    email: "maria.torres@correo.pe",
    phone: "",
    observations: "Segunda práctica supervisada.",
  },
  {
    code: "P-003",
    name: "Ana Lucía",
    lastName: "Vega Castillo",
    dni: "71830452",
    birthDate: "1991-06-24",
    email: "ana.vega@correo.pe",
    phone: "956 210 483",
    observations: "",
  },
  {
    code: "P-004",
    name: "Camila",
    lastName: "Chávez Ruiz",
    dni: "74291630",
    birthDate: "1996-11-09",
    email: "camila.chavez@correo.pe",
    phone: "944 318 760",
    observations: "",
  },
  {
    code: "P-005",
    name: "Noelia",
    lastName: "Acosta Paredes",
    dni: "69420518",
    birthDate: "1985-03-14",
    email: "noelia.acosta@correo.pe",
    phone: "",
    observations: "Práctica de refuerzo.",
  },
  {
    code: "P-006",
    name: "Rocío",
    lastName: "Vásquez Luna",
    dni: "72658104",
    birthDate: "1993-09-27",
    email: "rocio.vasquez@correo.pe",
    phone: "982 650 417",
    observations: "",
  },
  {
    code: "P-007",
    name: "Claudia",
    lastName: "Núñez Campos",
    dni: "70381469",
    birthDate: "1989-12-05",
    email: "claudia.nunez@correo.pe",
    phone: "",
    observations: "",
  },
  {
    code: "P-008",
    name: "Sofía",
    lastName: "León Vargas",
    dni: "75192043",
    birthDate: "1998-04-16",
    email: "sofia.leon@correo.pe",
    phone: "975 402 186",
    observations: "",
  },
  {
    code: "P-009",
    name: "Daniela",
    lastName: "Ruiz Mendoza",
    dni: "73910482",
    birthDate: "1995-08-30",
    email: "daniela.ruiz@correo.pe",
    phone: "961 238 705",
    observations: "",
  },
  {
    code: "P-010",
    name: "Elena",
    lastName: "Flores Salas",
    dni: "68254731",
    birthDate: "1983-01-21",
    email: "elena.flores@correo.pe",
    phone: "",
    observations: "",
  },
  {
    code: "P-011",
    name: "Patricia",
    lastName: "Lozano Medina",
    dni: "71630584",
    birthDate: "1990-05-12",
    email: "patricia.lozano@correo.pe",
    phone: "966 410 852",
    observations: "",
  },
  {
    code: "P-012",
    name: "Verónica",
    lastName: "Arias Peña",
    dni: "72845196",
    birthDate: "1992-07-08",
    email: "veronica.arias@correo.pe",
    phone: "",
    observations: "",
  },
  {
    code: "P-013",
    name: "Natalia",
    lastName: "Peña Rojas",
    dni: "75420381",
    birthDate: "1999-01-26",
    email: "natalia.pena@correo.pe",
    phone: "952 638 170",
    observations: "",
  },
  {
    code: "P-014",
    name: "Brenda",
    lastName: "Salazar Campos",
    dni: "70963825",
    birthDate: "1987-12-17",
    email: "brenda.salazar@correo.pe",
    phone: "984 201 376",
    observations: "",
  },
  {
    code: "P-015",
    name: "Alejandra",
    lastName: "Rivas Soto",
    dni: "73184602",
    birthDate: "1994-09-04",
    email: "alejandra.rivas@correo.pe",
    phone: "",
    observations: "",
  },
  {
    code: "P-016",
    name: "Mirella",
    lastName: "Soto Pacheco",
    dni: "69518437",
    birthDate: "1986-06-29",
    email: "mirella.soto@correo.pe",
    phone: "973 520 461",
    observations: "",
  },
  {
    code: "P-017",
    name: "Jimena",
    lastName: "Paredes León",
    dni: "74652019",
    birthDate: "1997-03-11",
    email: "jimena.paredes@correo.pe",
    phone: "",
    observations: "",
  },
  {
    code: "P-018",
    name: "Karina",
    lastName: "Espinoza Ruiz",
    dni: "68724350",
    birthDate: "1984-08-22",
    email: "karina.espinoza@correo.pe",
    phone: "945 860 213",
    observations: "",
  },
  {
    code: "P-019",
    name: "Melissa",
    lastName: "Chávez Mora",
    dni: "75260814",
    birthDate: "1998-10-15",
    email: "melissa.chavez@correo.pe",
    phone: "",
    observations: "",
  },
  {
    code: "P-020",
    name: "Fiorella",
    lastName: "Campos Díaz",
    dni: "72409563",
    birthDate: "1993-04-07",
    email: "fiorella.campos@correo.pe",
    phone: "978 341 625",
    observations: "",
  },
  {
    code: "P-021",
    name: "Beatriz",
    lastName: "Ramos Vega",
    dni: "67853421",
    birthDate: "1982-11-19",
    email: "beatriz.ramos@correo.pe",
    phone: "",
    observations: "",
  },
  {
    code: "P-022",
    name: "Adriana",
    lastName: "Luna Flores",
    dni: "73821605",
    birthDate: "1995-02-28",
    email: "adriana.luna@correo.pe",
    phone: "960 714 832",
    observations: "",
  },
  {
    code: "P-023",
    name: "Gabriela",
    lastName: "Torres Castillo",
    dni: "70549218",
    birthDate: "1988-07-31",
    email: "gabriela.torres@correo.pe",
    phone: "",
    observations: "",
  },
  {
    code: "P-024",
    name: "Silvia",
    lastName: "Castro Núñez",
    dni: "71968403",
    birthDate: "1991-12-09",
    email: "silvia.castro@correo.pe",
    phone: "951 286 740",
    observations: "",
  },
];

const sessions = [
  { id: 24, date: "23 JUL 2026 · 19:42", dateISO: "2026-07-23", participant: "Silvia Castro Núñez", instructor: "Teresa Quiroz", duration: "03:06", losses: 0, inRange: 86 },
  { id: 23, date: "23 JUL 2026 · 18:10", dateISO: "2026-07-23", participant: "Gabriela Torres Castillo", instructor: "Teresa Quiroz", duration: "02:48", losses: 0, inRange: 82 },
  { id: 22, date: "23 JUL 2026 · 16:35", dateISO: "2026-07-23", participant: "Adriana Luna Flores", instructor: "Luciana Herrera", duration: "03:21", losses: 1, inRange: 79 },
  { id: 21, date: "23 JUL 2026 · 14:20", dateISO: "2026-07-23", participant: "Beatriz Ramos Vega", instructor: "Carmen Valdivia", duration: "02:57", losses: 0, inRange: 84 },
  { id: 20, date: "23 JUL 2026 · 11:05", dateISO: "2026-07-23", participant: "Fiorella Campos Díaz", instructor: "Andrea Cárdenas", duration: "03:34", losses: 0, inRange: 77 },
  { id: 19, date: "22 JUL 2026 · 17:40", dateISO: "2026-07-22", participant: "Melissa Chávez Mora", instructor: "Gabriela Mendoza", duration: "02:51", losses: 1, inRange: 75 },
  { id: 18, date: "22 JUL 2026 · 15:10", dateISO: "2026-07-22", participant: "Karina Espinoza Ruiz", instructor: "Laura Benavides", duration: "03:42", losses: 0, inRange: 88 },
  { id: 17, date: "22 JUL 2026 · 10:45", dateISO: "2026-07-22", participant: "Jimena Paredes León", instructor: "Nora Soria", duration: "02:39", losses: 0, inRange: 80 },
  { id: 16, date: "21 JUL 2026 · 16:25", dateISO: "2026-07-21", participant: "Mirella Soto Pacheco", instructor: "Elisa Pastor", duration: "03:15", losses: 2, inRange: 69 },
  { id: 15, date: "21 JUL 2026 · 12:05", dateISO: "2026-07-21", participant: "Alejandra Rivas Soto", instructor: "Julia Araujo", duration: "02:44", losses: 0, inRange: 83 },
  { id: 14, date: "21 JUL 2026 · 09:30", dateISO: "2026-07-21", participant: "Brenda Salazar Campos", instructor: "Paola Medina", duration: "03:28", losses: 0, inRange: 81 },
  { id: 13, date: "20 JUL 2026 · 17:15", dateISO: "2026-07-20", participant: "Natalia Peña Rojas", instructor: "Renata Silva", duration: "02:36", losses: 0, inRange: 90 },
  { id: 12, date: "20 JUL 2026 · 14:00", dateISO: "2026-07-20", participant: "Verónica Arias Peña", instructor: "Mónica Yáñez", duration: "03:09", losses: 1, inRange: 76 },
  { id: 11, date: "20 JUL 2026 · 10:20", dateISO: "2026-07-20", participant: "Patricia Lozano Medina", instructor: "Andrea Cárdenas", duration: "02:53", losses: 0, inRange: 85 },
  { id: 10, date: "19 JUL 2026 · 16:10", dateISO: "2026-07-19", participant: "Elena Flores Salas", instructor: "Gabriela Mendoza", duration: "03:31", losses: 0, inRange: 78 },
  { id: 9, date: "19 JUL 2026 · 13:40", dateISO: "2026-07-19", participant: "Daniela Ruiz Mendoza", instructor: "Laura Benavides", duration: "02:47", losses: 1, inRange: 73 },
  { id: 8, date: "19 JUL 2026 · 09:50", dateISO: "2026-07-19", participant: "Sofía León Vargas", instructor: "Nora Soria", duration: "03:18", losses: 0, inRange: 87 },
  { id: 7, date: "18 JUL 2026 · 15:35", dateISO: "2026-07-18", participant: "Claudia Núñez Campos", instructor: "Elisa Pastor", duration: "02:42", losses: 0, inRange: 79 },
  { id: 6, date: "18 JUL 2026 · 11:15", dateISO: "2026-07-18", participant: "Rocío Vásquez Luna", instructor: "Julia Araujo", duration: "03:25", losses: 1, inRange: 74 },
  { id: 5, date: "18 JUL 2026 · 09:10", dateISO: "2026-07-18", participant: "Camila Chávez Ruiz", instructor: "Johana Barriga", duration: "03:24", losses: 0, inRange: 81 },
  { id: 4, date: "17 JUL 2026 · 16:05", dateISO: "2026-07-17", participant: "Noelia Acosta Paredes", instructor: "Rosa Alfaro", duration: "04:02", losses: 2, inRange: 66 },
  { id: 3, date: "17 JUL 2026 · 15:10", dateISO: "2026-07-17", participant: "Ana Lucía Vega Castillo", instructor: "Vania Abanto", duration: "02:46", losses: 0, inRange: 84 },
  { id: 2, date: "17 JUL 2026 · 14:50", dateISO: "2026-07-17", participant: "María Torres Salazar", instructor: "Diana Mávila", duration: "03:18", losses: 1, inRange: 71 },
  { id: 1, date: "17 JUL 2026 · 14:30", dateISO: "2026-07-17", participant: "Fulana Quispe Rojas", instructor: "Vania Abanto", duration: "02:00", losses: 0, inRange: 78 },
].map((session, index) => {
  const averageValue = 9.4 + (index % 6) * 0.4;
  return {
    ...session,
    average: `${averageValue.toFixed(1)} N`,
    maximum: `${(averageValue + 4.1).toFixed(1)} N`,
    minimum: `${(averageValue - 3).toFixed(1)} N`,
    variability: `± ${(1.4 + (index % 5) * 0.3).toFixed(1)} N`,
  };
});

const instructors = [
  { name: "Vania Abanto", role: "Investigadora principal", initials: "VA", count: 18, patients: ["Fulana Quispe", "Ana Lucía Vega", "Camila Chávez", "Noelia Acosta", "María Torres"] },
  { name: "Diana Mávila", role: "Instructora clínica", initials: "DM", count: 14, patients: ["Rocío Vásquez", "Claudia Núñez", "María Torres", "Sofía León"] },
  { name: "Rosa Alfaro", role: "Especialista de campo", initials: "RA", count: 12, patients: ["Noelia Acosta", "Daniela Ruiz", "Elena Flores"] },
  { name: "Johana Barriga", role: "Instructora clínica", initials: "JB", count: 11, patients: ["Camila Chávez", "Luisa Paredes", "Karen Ríos", "Fátima Soto"] },
  { name: "Mónica Yáñez", role: "Supervisora", initials: "MY", count: 9, patients: ["Pilar Ramos", "Andrea Luna", "Irene Peña"] },
  { name: "Renata Silva", role: "Instructora clínica", initials: "RS", count: 8, patients: ["Nadia Campos", "Lucía Mora", "Cecilia Rey"] },
  { name: "Paola Medina", role: "Especialista", initials: "PM", count: 7, patients: ["Eva Salas", "Silvia Paz", "Carla Gil"] },
  { name: "Julia Araujo", role: "Instructora clínica", initials: "JA", count: 6, patients: ["Alba Mejía", "Rita Valle"] },
  { name: "Elisa Pastor", role: "Facilitadora", initials: "EP", count: 5, patients: ["Mía Tapia", "Luz Castro"] },
  { name: "Nora Soria", role: "Facilitadora", initials: "NS", count: 4, patients: ["Sara Cano", "Julia Rosas"] },
  { name: "Laura Benavides", role: "Especialista clínica", initials: "LB", count: 10, patients: ["Teresa Vidal", "Alicia Peña", "Diana Castro", "Marta Ríos"] },
  { name: "Gabriela Mendoza", role: "Facilitadora clínica", initials: "GM", count: 8, patients: ["Valeria Cruz", "Paula Torres", "Milagros Soto"] },
  { name: "Andrea Cárdenas", role: "Instructora de campo", initials: "AC", count: 13, patients: ["Patricia Lozano", "Verónica Arias", "Natalia Peña", "Brenda Salazar"] },
  { name: "Carmen Valdivia", role: "Especialista clínica", initials: "CV", count: 9, patients: ["Alejandra Rivas", "Mirella Soto", "Jimena Paredes"] },
  { name: "Luciana Herrera", role: "Facilitadora", initials: "LH", count: 7, patients: ["Karina Espinoza", "Melissa Chávez", "Fiorella Campos"] },
  { name: "Teresa Quiroz", role: "Supervisora clínica", initials: "TQ", count: 11, patients: ["Beatriz Ramos", "Adriana Luna", "Gabriela Torres", "Silvia Castro"] },
];

const state = {
  gloveStatus: "connected",
  currentScreen: "home",
  selectedParticipant: "P-001",
  instructorOffset: 0,
  elapsed: 84,
  activePoint: 5,
  transitioning: false,
  instructorCarouselTimer: null,
  sensorTimer: null,
  clockTimer: null,
  chartData: Array.from({ length: 32 }, (_, index) => ({
    index: 9.8 + Math.sin(index / 3) * 1.8,
    middle: 8.7 + Math.cos(index / 4) * 1.4,
  })),
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

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

function normalizeSearch(value) {
  return String(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es");
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
  state.gloveStatus = status;
  updateGloveUI();
}

function cycleGloveStatus() {
  const order = ["connected", "disconnected", "connecting", "error"];
  const next = (order.indexOf(state.gloveStatus) + 1) % order.length;
  setGloveStatus(order[next]);
}

function navigate(screen) {
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
  if (screen === "history") renderHistory();
  if (screen === "people") {
    renderInstructors();
    if (!$("#instructorOverview").hidden) startInstructorAutoplay();
  } else {
    stopInstructorAutoplay();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderParticipants() {
  const select = $("#participantSelect");
  select.innerHTML = participants
    .map(
      (participant) =>
        `<option value="${safe(participant.code)}">${safe(participant.code)} — ${safe(participant.name)} ${safe(participant.lastName)}</option>`,
    )
    .join("");
  select.value = state.selectedParticipant;
  const displayedTotal = participants.length;
  $("#participantMetric").textContent = String(displayedTotal);
  $("#participantCount").textContent = String(displayedTotal);
  updateGloveUI();
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
          <span class="range-value">${session.inRange}% en rango</span>
        </div>`,
    )
    .join("");
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
              <strong>${safe(session.participant)}</strong>
              <span>${safe(session.instructor)}</span>
              <span>${safe(session.duration)}</span>
              <time>${safe(session.date)}</time>
              <button class="detail-button" type="button" data-session-id="${session.id}">Detalles <span>↗</span></button>
            </article>`,
        )
        .join("")
    : '<div class="empty-state"><strong>No se encontraron sesiones</strong><span>Prueba limpiando los filtros.</span></div>';

  $$(".detail-button", $("#historyRecords")).forEach((button) => {
    button.addEventListener("click", () => openSessionDetail(Number(button.dataset.sessionId)));
  });
}

function openSessionDetail(sessionId) {
  const session = sessions.find((item) => item.id === sessionId);
  if (!session) return;
  $("#detailRecord").textContent = `REGISTRO #${String(session.id).padStart(3, "0")}`;
  $("#detailParticipant").textContent = session.participant;
  $("#detailInstructor").textContent = session.instructor;
  $("#detailDuration").textContent = `${session.duration} min`;
  $("#detailDate").textContent = formatSessionDate(session.dateISO);
  $("#detailRange").textContent = `${session.inRange}%`;
  $("#insideRange").textContent = `${session.inRange}%`;
  $("#outsideRange").textContent = `${100 - session.inRange}%`;
  $("#detailDonut").style.setProperty("--donut", `${session.inRange * 3.6}deg`);
  $("#indicatorList").innerHTML = `
    <div><dt>Presión promedio</dt><dd>${safe(session.average)}</dd></div>
    <div><dt>Presión máxima</dt><dd>${safe(session.maximum)}</dd></div>
    <div><dt>Presión mínima</dt><dd>${safe(session.minimum)}</dd></div>
    <div><dt>Desviación / variabilidad</dt><dd>${safe(session.variability)}</dd></div>
    <div><dt>Pérdidas de conexión</dt><dd>${session.losses}</dd></div>`;
  $("#detailBackdrop").hidden = false;
  $(".detail-scroll").scrollTop = 0;
  const detailData = Array.from({ length: 40 }, (_, index) => ({
    index: 10.5 + Math.sin(index / 3) * 2.1 + (index % 7) * 0.08,
    middle: 8.8 + Math.cos(index / 4.2) * 1.7,
  }));
  requestAnimationFrame(() => drawChart($("#detailChart"), detailData, true));
}

function closeSessionDetail() {
  $("#detailBackdrop").hidden = true;
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

function openParticipantModal() {
  $("#participantForm").reset();
  $("#newCode").value = `P-${String(participants.length + 1).padStart(3, "0")}`;
  $("#participantBackdrop").hidden = false;
}

function closeParticipantModal() {
  $("#participantBackdrop").hidden = true;
}

function saveParticipant(event) {
  event.preventDefault();
  const participant = {
    code: $("#newCode").value,
    name: $("#newName").value.trim(),
    lastName: $("#newLastName").value.trim(),
    dni: $("#newDni").value.trim(),
    birthDate: $("#newBirthDate").value,
    email: $("#newEmail").value.trim(),
    phone: $("#newPhone").value.trim(),
    observations: $("#newObservations").value.trim(),
  };
  participants.push(participant);
  state.selectedParticipant = participant.code;
  renderParticipants();
  closeParticipantModal();
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

function drawChart(canvas, data, compact = false) {
  if (!canvas || canvas.hidden || !canvas.getContext) return;
  const width = Math.max(canvas.clientWidth, 320);
  const renderedHeight = Math.round(canvas.getBoundingClientRect().height);
  const height = Math.max(88, renderedHeight || (compact ? 150 : 120));
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const context = canvas.getContext("2d");
  context.scale(ratio, ratio);
  context.clearRect(0, 0, width, height);
  const padding = Math.max(20, Math.min(compact ? 30 : 32, height * 0.22));
  const chartWidth = width - padding * 1.5;
  const chartHeight = height - padding * 1.4;
  context.strokeStyle = "#deded9";
  context.lineWidth = 1;

  for (let line = 0; line <= 4; line += 1) {
    const y = padding / 2 + (chartHeight / 4) * line;
    context.beginPath();
    context.moveTo(padding, y);
    context.lineTo(width - padding / 2, y);
    context.stroke();
  }

  context.fillStyle = "#777772";
  context.font = "10px Segoe UI";
  context.fillText("16 N", 2, padding / 2 + 3);
  context.fillText("0 N", 8, padding / 2 + chartHeight + 3);

  const drawLine = (key, color) => {
    context.strokeStyle = color;
    context.lineWidth = compact ? 2 : 2.5;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.beginPath();
    data.forEach((point, pointIndex) => {
      const x =
        padding +
        (pointIndex / Math.max(data.length - 1, 1)) * (chartWidth - padding / 2);
      const y = padding / 2 + chartHeight - (point[key] / 16) * chartHeight;
      if (pointIndex === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
  };
  drawLine("index", "#171715");
  drawLine("middle", "#a3a39d");
}

function updateSensors() {
  if (state.gloveStatus !== "connected" || state.currentScreen !== "training") return;
  const index = 10.8 + Math.random() * 3.2;
  const middle = 7.5 + Math.random() * 3.6;
  state.chartData.push({ index, middle });
  state.chartData = state.chartData.slice(-48);
  state.activePoint = state.activePoint >= 8 ? 1 : state.activePoint + 1;
  updateSensorReading("index", index, 9.5, 13.5);
  updateSensorReading("middle", middle, 8.5, 12.5);
  updateTouchPoints();
  drawChart($("#liveChart"), state.chartData);
}

function startSensors() {
  stopSensors();
  state.sensorTimer = window.setInterval(updateSensors, 650);
  state.clockTimer = window.setInterval(() => {
    if (state.gloveStatus === "connected" && state.currentScreen === "training") {
      state.elapsed += 1;
      $("#sessionClock").textContent = formatTime(state.elapsed);
    }
  }, 1000);
  updateSensors();
}

function stopSensors() {
  if (state.sensorTimer) window.clearInterval(state.sensorTimer);
  if (state.clockTimer) window.clearInterval(state.clockTimer);
  state.sensorTimer = null;
  state.clockTimer = null;
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

function startTraining() {
  if (state.gloveStatus !== "connected") return;
  const participant = participants.find((item) => item.code === state.selectedParticipant);
  if (!participant) return;
  $("#trainingParticipant").textContent = `${participant.name} ${participant.lastName}`;
  state.elapsed = 84;
  state.activePoint = 5;
  $("#sessionClock").textContent = formatTime(state.elapsed);
  updateTouchPoints();
  playDashboardTransition({
    title: "Iniciando entrenamiento",
    onClosed: () => navigate("training"),
    onComplete: () => {
      startSensors();
      drawChart($("#liveChart"), state.chartData);
    },
  });
}

function finishTraining() {
  stopSensors();
  playDashboardTransition({
    title: "Finalizando entrenamiento",
    onClosed: () => navigate("home"),
  });
}

function exportSessions() {
  const header = [
    "Participante",
    "Instructora",
    "Duración",
    "Fecha",
    "Presión promedio",
    "Tiempo en rango",
  ];
  const rows = sessions.map((session) => [
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

function bindEvents() {
  $("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    $("#loginPage").hidden = true;
    $("#appShell").hidden = false;
    navigate("home");
  });

  $("#togglePassword").addEventListener("click", () => {
    const input = $("#password");
    input.type = input.type === "password" ? "text" : "password";
    $("#togglePassword").textContent = input.type === "password" ? "Ver" : "Ocultar";
  });

  $("#cycleStatus").addEventListener("click", cycleGloveStatus);
  $("#participantSelect").addEventListener("change", (event) => {
    state.selectedParticipant = event.target.value;
    updateGloveUI();
  });
  $("#startTraining").addEventListener("click", startTraining);
  $("#finishTraining").addEventListener("click", finishTraining);
  $("#logoutButton").addEventListener("click", () => {
    stopSensors();
    navigate("home");
    $("#appShell").hidden = true;
    $("#loginPage").hidden = false;
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
    button.addEventListener("click", () => setGloveStatus(button.dataset.status));
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
}

function initialize() {
  renderParticipants();
  renderRecentSessions();
  populateHistoryFilters();
  renderHistory();
  renderInstructors();
  updateGloveUI();
  updateClock();
  window.setInterval(updateClock, 1000);
  bindEvents();
}

document.addEventListener("DOMContentLoaded", initialize);
