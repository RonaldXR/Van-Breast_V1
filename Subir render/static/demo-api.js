"use strict";

// Adaptador local para la demostración estática. Imita las respuestas de Flask
// en memoria para que la interfaz pueda recorrerse sin servidor ni base de datos.
(() => {
  const nativeFetch = window.fetch.bind(window);
  const instructorIds = ["instructor-vania", "instructor-jonathan"];
  let authenticatedUser = null;
  let gloveStatus = "connected";
  let activeSession = null;
  let nextParticipantNumber = 9;
  let nextSessionNumber = 11;

  const participants = [
    ["P-001", "Valeria", "Mendoza Ruiz", "73481920", "valeria.mendoza@correo.pe", 0],
    ["P-002", "Camila", "Torres Salazar", "70184263", "camila.torres@correo.pe", 0],
    ["P-003", "Daniela", "Quispe Rojas", "71830452", "daniela.quispe@correo.pe", 0],
    ["P-004", "Andrea", "Flores Paredes", "74291630", "andrea.flores@correo.pe", 1],
    ["P-005", "Lucía", "Vargas Medina", "69420518", "lucia.vargas@correo.pe", 1],
    ["P-006", "Silvia", "Castro Núñez", "72846109", "silvia.castro@correo.pe", 0],
    ["P-007", "Gabriela", "Torres Castillo", "71620483", "gabriela.torres@correo.pe", 1],
    ["P-008", "Adriana", "Luna Flores", "70519382", "adriana.luna@correo.pe", 1],
  ].map(([code, name, lastName, dni, email, instructorIndex], index) => ({
    id: `participant-${index + 1}`,
    code,
    name,
    lastName,
    dni,
    birthDate: `199${index % 8}-0${(index % 8) + 1}-1${index % 9}`,
    email,
    instructorId: instructorIds[instructorIndex],
    phone: `9${String(73140520 + index * 137).padStart(8, "0")}`,
    observations: index % 3 === 1 ? "Práctica de seguimiento." : "",
  }));

  const instructors = [
    {
      id: instructorIds[0],
      name: "Vania Abanto",
      email: "vabanto@uch.edu.pe",
      role: "Investigadora principal",
      initials: "VA",
      count: 4,
      patients: ["Valeria Mendoza Ruiz", "Camila Torres Salazar", "Daniela Quispe Rojas", "Silvia Castro Núñez"],
    },
    {
      id: instructorIds[1],
      name: "Jonathan Arzapalo",
      email: "jarzapalo@uch.edu.pe",
      role: "Instructor clínico",
      initials: "JA",
      count: 4,
      patients: ["Andrea Flores Paredes", "Lucía Vargas Medina", "Gabriela Torres Castillo", "Adriana Luna Flores"],
    },
  ];

  function chartSeries(seed = 0, length = 48) {
    return Array.from({ length }, (_, index) => ({
      index: Number((10.9 + Math.sin((index + seed) / 4.3) * 1.7 + Math.sin(index / 1.8) * 0.35).toFixed(2)),
      middle: Number((9.5 + Math.cos((index + seed) / 5.2) * 1.25 + Math.sin(index / 2.3) * 0.28).toFixed(2)),
      zone: (index % 8) + 1,
      elapsedMs: index * 650,
    }));
  }

  function makeSession(recordNumber, participantCode, instructor, date, dateISO, duration, inRange, seed) {
    const participant = participants.find((item) => item.code === participantCode);
    const totalSeconds = duration.split(":").reduce((total, part) => total * 60 + Number(part), 0);
    const correctSeconds = Math.round(totalSeconds * inRange / 100);
    return {
      id: `session-${recordNumber}`,
      recordNumber,
      status: "completed",
      date,
      dateISO,
      startedAtISO: `${dateISO}T15:00:00-05:00`,
      participantCode,
      participant: `${participant.name} ${participant.lastName}`,
      instructor,
      duration,
      losses: recordNumber % 6 === 0 ? 1 : 0,
      inRange,
      correctSeconds,
      incorrectSeconds: totalSeconds - correctSeconds,
      average: "9.8 N",
      indexAverage: "10.6 N",
      middleAverage: "9.0 N",
      indexRating: "Presión adecuada",
      middleRating: inRange >= 70 ? "Presión adecuada" : "Requiere ajuste",
      maximum: "13.4 N",
      minimum: "6.8 N",
      variability: "± 1.3 N",
      adequate: inRange >= 70,
      elapsedSeconds: totalSeconds,
      chartData: chartSeries(seed),
      sampleCount: 48,
    };
  }

  let sessions = [
    makeSession(10, "P-006", "Vania Abanto", "28 JUL 2026 · 19:42", "2026-07-28", "03:06", 86, 1),
    makeSession(9, "P-007", "Jonathan Arzapalo", "28 JUL 2026 · 18:10", "2026-07-28", "02:48", 82, 3),
    makeSession(8, "P-008", "Jonathan Arzapalo", "28 JUL 2026 · 16:35", "2026-07-28", "03:21", 79, 5),
    makeSession(7, "P-004", "Jonathan Arzapalo", "28 JUL 2026 · 14:20", "2026-07-28", "02:57", 84, 7),
    makeSession(6, "P-003", "Vania Abanto", "27 JUL 2026 · 15:15", "2026-07-27", "02:44", 88, 9),
    makeSession(5, "P-002", "Vania Abanto", "27 JUL 2026 · 11:20", "2026-07-27", "03:02", 81, 11),
    makeSession(4, "P-001", "Vania Abanto", "26 JUL 2026 · 09:40", "2026-07-26", "02:38", 79, 13),
    makeSession(3, "P-005", "Jonathan Arzapalo", "25 JUL 2026 · 16:00", "2026-07-25", "02:52", 80, 15),
  ];

  function userFor(mode) {
    if (mode === "admin") {
      return {
        id: "demo-admin",
        email: "admin@vanbreast.local",
        name: "Administración",
        role: "admin",
        roleLabel: "Modo administrador",
        initials: "AD",
      };
    }
    return {
      id: instructorIds[0],
      email: "vabanto@uch.edu.pe",
      name: "Vania Abanto",
      role: "clinical",
      roleLabel: "Investigadora principal",
      initials: "VA",
    };
  }

  function dashboardStats() {
    return {
      sessionsToday: sessions.filter((session) => session.dateISO === "2026-07-28").length,
      participants: participants.length,
      instructors: instructors.length,
      weekly: [
        { label: "L", count: 3 },
        { label: "M", count: 5 },
        { label: "X", count: 4 },
        { label: "J", count: 6 },
        { label: "V", count: 4 },
        { label: "S", count: 3 },
        { label: "D", count: 2 },
      ],
      weeklyTotal: 27,
    };
  }

  function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  function parseBody(options) {
    if (!options?.body) return {};
    if (typeof options.body === "string") {
      try {
        return JSON.parse(options.body);
      } catch {
        return {};
      }
    }
    return options.body;
  }

  function sessionEvaluation(session, durationSeconds) {
    const points = session.chartData.length ? session.chartData : chartSeries(4, 32);
    const indexValues = points.map((point) => Number(point.index));
    const middleValues = points.map((point) => Number(point.middle));
    const allValues = [...indexValues, ...middleValues];
    const average = (values) => values.reduce((total, value) => total + value, 0) / values.length;
    const correctPoints = points.filter(
      (point) => point.index >= 9.5 && point.index <= 13.5 && point.middle >= 8.5 && point.middle <= 12.5,
    ).length;
    const inRange = Math.round((correctPoints / points.length) * 100);
    const correctSeconds = Math.round(durationSeconds * inRange / 100);
    return {
      ...session,
      status: "draft",
      duration: `${String(Math.floor(durationSeconds / 60)).padStart(2, "0")}:${String(durationSeconds % 60).padStart(2, "0")}`,
      elapsedSeconds: durationSeconds,
      inRange,
      correctSeconds,
      incorrectSeconds: durationSeconds - correctSeconds,
      average: `${average(allValues).toFixed(1)} N`,
      indexAverage: `${average(indexValues).toFixed(1)} N`,
      middleAverage: `${average(middleValues).toFixed(1)} N`,
      indexRating: "Presión adecuada",
      middleRating: "Presión adecuada",
      maximum: `${Math.max(...allValues).toFixed(1)} N`,
      minimum: `${Math.min(...allValues).toFixed(1)} N`,
      variability: "± 1.2 N",
      adequate: inRange >= 70,
      sampleCount: points.length,
    };
  }

  async function demoFetch(input, options = {}) {
    const rawUrl = typeof input === "string" ? input : input.url;
    const url = new URL(rawUrl, window.location.href);
    const path = url.pathname;
    const method = String(options.method || "GET").toUpperCase();
    const body = parseBody(options);

    if (!path.startsWith("/api/")) return nativeFetch(input, options);

    if (path === "/api/auth/login" && method === "POST") {
      authenticatedUser = userFor(body.mode);
      return json({ authenticated: true, csrfToken: "static-demo", user: authenticatedUser });
    }
    if (path === "/api/auth/me") {
      return authenticatedUser
        ? json({ authenticated: true, csrfToken: "static-demo", user: authenticatedUser })
        : json({ error: "Inicia sesión para explorar la demostración." }, 401);
    }
    if (path === "/api/auth/logout" && method === "POST") {
      authenticatedUser = null;
      activeSession = null;
      return json({ authenticated: false });
    }
    if (path === "/api/bootstrap") {
      return json({
        participants,
        sessions,
        instructors,
        stats: dashboardStats(),
        activeSession,
        glove: { status: gloveStatus, transport: "simulator", simulationAllowed: true },
      });
    }
    if (path === "/api/glove/status") {
      if (method === "PUT") gloveStatus = body.status || gloveStatus;
      return json({ status: gloveStatus, transport: "simulator", simulationAllowed: true });
    }
    if (path === "/api/glove/reading") {
      const sample = activeSession?.chartData?.length || 0;
      const elapsed = sample * 650;
      const point = {
        index: Number((11.2 + Math.sin(sample / 4) * 1.45 + Math.sin(sample / 1.7) * 0.25).toFixed(2)),
        middle: Number((9.7 + Math.cos(sample / 5) * 1.1 + Math.sin(sample / 2.2) * 0.2).toFixed(2)),
        zone: (sample % 8) + 1,
        elapsedMs: elapsed,
      };
      return json(point);
    }
    if (path === "/api/sessions/current") return json({ session: activeSession });
    if (path === "/api/sessions" && method === "POST") {
      if (activeSession) return json({ error: "Ya existe una sesión activa.", sessionId: activeSession.id }, 409);
      const participant = participants.find((item) => item.code === body.participantCode);
      if (!participant) return json({ error: "Selecciona una participante válida." }, 400);
      activeSession = {
        id: `demo-active-${Date.now()}`,
        recordNumber: nextSessionNumber,
        status: "active",
        date: "01 AGO 2026 · 10:30",
        dateISO: "2026-08-01",
        participantCode: participant.code,
        participant: `${participant.name} ${participant.lastName}`,
        instructor: authenticatedUser?.name || "Vania Abanto",
        duration: "00:00",
        elapsedSeconds: 0,
        losses: 0,
        chartData: [],
        sampleCount: 0,
      };
      return json(activeSession, 201);
    }

    const sessionMatch = path.match(/^\/api\/sessions\/([^/]+)(?:\/(checkpoint|finish|resume|confirm))?$/);
    if (sessionMatch) {
      const [, sessionId, action] = sessionMatch;
      const stored = sessions.find((session) => session.id === sessionId);
      if (!action && method === "GET") return stored ? json(stored) : json({ error: "Sesión no encontrada." }, 404);
      if (!activeSession || activeSession.id !== sessionId) return json({ error: "La sesión no está activa." }, 409);
      if (action === "checkpoint" && method === "PUT") {
        activeSession.elapsedSeconds = Number(body.elapsedSeconds) || activeSession.elapsedSeconds;
        if (Array.isArray(body.measurements)) activeSession.chartData.push(...body.measurements);
        activeSession.sampleCount = activeSession.chartData.length;
        return json({ id: activeSession.id, sampleCount: activeSession.sampleCount });
      }
      if (action === "finish" && method === "POST") {
        activeSession = sessionEvaluation(activeSession, Math.max(1, Number(body.durationSeconds) || 1));
        return json(activeSession);
      }
      if (action === "resume" && method === "POST") {
        activeSession.status = "active";
        return json({ id: activeSession.id, status: "active" });
      }
      if (action === "confirm" && method === "POST") {
        const completed = { ...activeSession, status: "completed" };
        sessions = [completed, ...sessions];
        nextSessionNumber += 1;
        activeSession = null;
        return json(completed);
      }
    }

    if (path === "/api/participants" && method === "POST") {
      const code = `P-${String(nextParticipantNumber).padStart(3, "0")}`;
      nextParticipantNumber += 1;
      const participant = {
        id: `participant-${Date.now()}`,
        code,
        ...body,
        instructorId: body.instructorId || instructorIds[0],
      };
      participants.push(participant);
      return json(participant, 201);
    }

    const participantMatch = path.match(/^\/api\/participants\/([^/]+)$/);
    if (participantMatch) {
      const participantIndex = participants.findIndex((item) => item.id === participantMatch[1]);
      if (participantIndex < 0) return json({ error: "Participante no encontrada." }, 404);
      if (method === "PUT") {
        participants[participantIndex] = { ...participants[participantIndex], ...body };
        return json(participants[participantIndex]);
      }
      if (method === "DELETE") {
        const [removed] = participants.splice(participantIndex, 1);
        return json({ message: `${removed.name} ${removed.lastName} fue eliminada de la demostración.` });
      }
    }

    if (path === "/api/admin/history" && method === "DELETE") {
      const deletedSessions = sessions.length;
      sessions = [];
      nextSessionNumber = 1;
      return json({ deletedSessions, deletedMeasurements: 0, deletedArchivedParticipants: 0 });
    }

    return json({ error: `Función de demostración no disponible: ${method} ${path}` }, 404);
  }

  window.fetch = demoFetch;
})();
