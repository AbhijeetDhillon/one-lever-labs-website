(() => {
  const week = [
    { name: "Light cardio", cardio: "60 min · Zone 2–3", gym: ["Light jog"], home: ["Light jog"] },
    { name: "Legs", gym: ["Squat", "Romanian deadlift", "Leg extension", "Leg curl", "Calf raise"], home: ["Goblet squat", "Dumbbell Romanian deadlift", "Band leg extension", "Band leg curl", "Standing calf raise"] },
    { name: "Rest", gym: [], home: [] },
    { name: "Chest, back & core", gym: ["Incline press", "Flat bench press", "Cable fly", "Lat pulldown", "Seated row", "Straight-arm pulldown", "Leg raise"], home: ["Dumbbell floor press", "Push-up", "Band fly", "Band pulldown", "Dumbbell row", "Band straight-arm pulldown", "Leg raise"] },
    { name: "Steady cardio", cardio: "25–30 min · High Zone 3 to Zone 4", gym: ["Bike"], home: ["Run"] },
    { name: "Shoulders, arms & core", gym: ["Overhead press", "Lateral raise", "Rear-delt fly", "Dumbbell curl", "Triceps pressdown", "Reverse crunch"], home: ["Dumbbell overhead press", "Dumbbell lateral raise", "Band rear-delt fly", "Dumbbell curl", "Band triceps extension", "Reverse crunch"] },
    { name: "Cardio intervals", cardio: "6–17 min of hard effort · High Zone 4 to Zone 5", gym: ["Bike intervals"], home: ["Running intervals"] }
  ];

  const sets = [
    { name: "Warm-up 1", factor: .4, reps: "6–10", rest: "1–2 min", seconds: 90 },
    { name: "Warm-up 2", factor: .65, reps: "4–8", rest: "2 min", seconds: 120 },
    { name: "Working set 1", factor: 1, reps: "6–12", rest: "2–3 min", seconds: 150 },
    { name: "Working set 2", factor: 1, reps: "6–12", rest: "2–3 min", seconds: 150 }
  ];
  const $ = (id) => document.getElementById(id);
  const storageKey = "oll.workout.v1";
  const dateKey = (date = new Date()) => {
    const parts = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
    return parts.map((part) => String(part).padStart(2, "0")).join("-");
  };
  const dayNumber = (date) => Date.parse(date) / 86400000;
  const distance = (from, to) => dayNumber(to) - dayNumber(from);
  const empty = () => ({ version: 1, start: dateKey(), equipment: "gym", unit: "kg", active: null, history: [] });
  const validDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value));
  const validName = (value) => typeof value === "string" && value.length > 0 && value.length <= 80;
  const validNumber = (value, max) => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= max;

  function validSession(session) {
    return session && validName(session.id) && validName(session.name) && validDate(session.date)
      && ["kg", "lb"].includes(session.unit) && Array.isArray(session.items) && session.items.length <= 40
      && session.items.every((item) => item && validName(item.name) && (
        item.kind === "cardio"
          ? typeof item.target === "string" && item.target.length <= 120 && validNumber(item.minutes, 1440) && ["", "1", "2", "3", "4", "5"].includes(item.zone)
          : item.kind === "strength" && validNumber(item.load, 9999) && Array.isArray(item.sets) && item.sets.length === 4
            && item.sets.every((set) => set === null || (set && validNumber(set.weight, 9999) && Number.isInteger(set.reps) && set.reps >= 1 && set.reps <= 999))
      ));
  }

  function validBackup(value) {
    return value && value.version === 1 && validDate(value.start) && ["gym", "home"].includes(value.equipment)
      && ["kg", "lb"].includes(value.unit) && (value.active === null || validSession(value.active))
      && Array.isArray(value.history) && value.history.every(validSession)
      && new Set(value.history.map((entry) => entry.id)).size === value.history.length
      && (value.restUntil === undefined || validNumber(value.restUntil, 8640000000000000));
  }

  let state = empty();
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!validBackup(parsed)) throw new Error("Invalid saved data");
      state = parsed;
    } else {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  } catch {
    $("notice").textContent = "Saved workouts could not be opened. Download a backup to keep new entries.";
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      return true;
    } catch {
      $("notice").textContent = "Browser storage is unavailable or full. Download a backup before closing.";
      return false;
    }
  }

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function button(label, action, primary = false) {
    const control = node("button", label, primary ? "primary" : "");
    control.type = "button";
    control.addEventListener("click", action);
    return control;
  }

  function field(label, control) {
    const wrapper = node("label", label);
    wrapper.append(control);
    return wrapper;
  }

  function input(type, value, options = {}) {
    return Object.assign(node("input"), { type, value }, options);
  }

  function select(entries, value) {
    const menu = node("select");
    for (const [key, label] of entries) {
      const option = node("option", label);
      option.value = key;
      menu.append(option);
    }
    menu.value = value;
    return menu;
  }

  function sortedHistory() {
    return [...state.history].sort((a, b) => b.date.localeCompare(a.date) || state.history.indexOf(b) - state.history.indexOf(a));
  }

  function previous(name, active) {
    for (const entry of sortedHistory()) {
      if (entry.id === active.id || entry.date > active.date) continue;
      const exercise = entry.items.find((item) => item.kind === "strength" && item.name.toLowerCase() === name.toLowerCase());
      const lastSet = exercise?.sets.slice(2).reverse().find(Boolean);
      if (lastSet) return { ...lastSet, unit: entry.unit, date: entry.date };
    }
    return null;
  }

  function strength(name, active) {
    const last = previous(name, active);
    const factor = last?.unit === active.unit ? 1 : active.unit === "lb" ? 1 / .45359237 : .45359237;
    return { name, kind: "strength", load: last ? Math.min(9999, Math.round(last.weight * factor * 100) / 100) : 0, sets: [null, null, null, null] };
  }

  function cardio(name, target = "") {
    return { name, kind: "cardio", target, minutes: 0, zone: "" };
  }

  function start(name, exercises = [], target) {
    const active = { id: crypto.randomUUID(), name, date: dateKey(), unit: state.unit, items: [] };
    active.items = exercises.map((exercise) => target ? cardio(exercise, target) : strength(exercise, active));
    state.active = active;
    state.restUntil = 0;
    save();
    window.ollTrack("workout_start", "workout");
    render();
    showSession();
  }

  function showSession() {
    $("session-title").focus();
    $("session").scrollIntoView({ block: "start" });
  }

  function renderPlan() {
    $("equipment").value = state.equipment;
    $("start-date").value = state.start;
    const offset = distance(state.start, dateKey());
    const today = Math.max(0, offset) % week.length;
    const plan = week[today];
    const panel = node("div", "", "today");
    panel.append(node("h3", `${offset < 0 ? "Plan starts " + state.start : "Today · Day " + (today + 1)} · ${plan.name}`));
    if (plan[state.equipment].length) {
      panel.append(node("p", plan.cardio ? plan.cardio : plan[state.equipment].join(" · ")));
      const action = button("Start workout", () => start(plan.name, plan[state.equipment], plan.cardio), true);
      action.disabled = Boolean(state.active);
      panel.append(action);
    } else {
      panel.append(node("p", "Rest day. You can still log a separate session below."));
    }
    $("today").replaceChildren(panel);
    $("suggestions").replaceChildren(...week.map((day, index) => {
      const card = node("article", "", "suggestion");
      card.append(node("h3", `Day ${index + 1} · ${day.name}`));
      if (day[state.equipment].length) {
        card.append(node("p", day.cardio ? `${day[state.equipment][0]} · ${day.cardio}` : day[state.equipment].join(" · ")));
        const action = button("Start", () => start(day.name, day[state.equipment], day.cardio));
        action.setAttribute("aria-label", "Start " + day.name);
        action.disabled = Boolean(state.active);
        card.append(action);
      }
      return card;
    }));
    $("custom").disabled = Boolean(state.active);
  }

  function renderStrength(item, active, block) {
    const bodyweight = /leg raise|reverse crunch|push-up|standing calf raise/i.test(item.name);
    const last = previous(item.name, active);
    if (last) block.append(node("p", `Last · ${last.weight || "Bodyweight"}${last.weight ? " " + last.unit : ""} × ${last.reps} reps · ${last.date}`, "fitness-note"));
    if (bodyweight) block.append(node("p", "Use an easier variation for warm-up sets if training with bodyweight.", "fitness-note"));
    const load = input("number", item.load, { min: 0, max: 9999, step: "any" });
    block.append(field(`Working weight (${active.unit})`, load));
    const weightInputs = [];
    const plannedWeight = (factor) => Math.round(item.load * factor * 100) / 100;
    load.addEventListener("input", () => {
      if (!load.validity.valid || load.value === "") return;
      item.load = load.valueAsNumber;
      weightInputs.forEach((weight, index) => {
        if (!item.sets[index]) weight.value = plannedWeight(sets[index].factor);
      });
      save();
    });

    sets.forEach((set, index) => {
      const logged = item.sets[index];
      const row = node("form", "", "set-row");
      const weight = input("number", logged?.weight ?? plannedWeight(set.factor), { required: true, min: 0, max: 9999, step: "any" });
      const reps = input("number", logged?.reps ?? "", { required: true, min: 1, max: 999, placeholder: set.reps });
      weightInputs.push(weight);
      const submit = node("button", logged ? "Update set" : "Log set", logged ? "" : "primary");
      submit.type = "submit";
      const status = node("span", logged ? "Logged" : "");
      status.setAttribute("role", "status");
      const clear = button("Clear set", () => {
        item.sets[index] = null;
        weight.value = plannedWeight(set.factor);
        reps.value = "";
        submit.textContent = "Log set";
        submit.classList.add("primary");
        status.textContent = "Set cleared";
        clear.hidden = true;
        submit.focus();
        save();
      });
      clear.hidden = !logged;
      row.append(node("strong", `${set.name} · ${set.reps} reps · ${set.rest} rest`), field(`Weight (${active.unit})`, weight), field("Reps", reps), submit, clear, status);
      row.addEventListener("submit", (event) => {
        event.preventDefault();
        const fresh = !item.sets[index];
        item.sets[index] = { weight: weight.valueAsNumber, reps: reps.valueAsNumber };
        if (fresh) state.restUntil = Date.now() + set.seconds * 1000;
        submit.textContent = "Update set";
        submit.classList.remove("primary");
        clear.hidden = false;
        status.textContent = "Set saved to this session";
        save();
        updateTimer();
      });
      block.append(row);
    });
  }

  function renderCardio(item, block) {
    if (item.target) block.append(node("p", item.target));
    if (item.target.includes("hard effort")) block.append(node("p", "Count hard intervals toward the target. Log warm-up, recovery, and cool-down separately if you want to track them.", "fitness-note"));
    const row = node("div", "", "fitness-row");
    const minutes = input("number", item.minutes || "", { min: 0, max: 1440, step: "any" });
    const zone = select([["", "Select zone"], ...[1, 2, 3, 4, 5].map((value) => [String(value), "Zone " + value])], item.zone);
    minutes.addEventListener("input", () => {
      if (!minutes.validity.valid) return;
      item.minutes = Number(minutes.value);
      save();
    });
    zone.addEventListener("change", () => {
      item.zone = zone.value;
      save();
    });
    row.append(field("Minutes", minutes), field("Main intensity", zone));
    block.append(row);
  }

  const timerLabel = () => {
    const seconds = Math.max(0, Math.ceil(((state.restUntil || 0) - Date.now()) / 1000));
    return seconds ? `Rest timer · ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "Rest timer ready";
  };

  function updateTimer() {
    const timer = $("rest-timer");
    if (timer) timer.textContent = timerLabel();
  }

  function finish() {
    const active = state.active;
    if (!active.items.some((item) => item.kind === "cardio" ? item.minutes > 0 : item.sets.some(Boolean))) {
      $("session-status").textContent = "Log a set or enter cardio minutes before finishing.";
      return;
    }
    const existing = state.history.findIndex((entry) => entry.id === active.id);
    if (existing === -1) {
      const first = state.history[0];
      const isReturn = state.history.length === 1 && first.date !== active.date
        && distance(first.date, active.date) > 0 && distance(first.date, active.date) <= 7;
      state.history.push(active);
      window.ollTrack("workout_save", "workout");
      if (isReturn) window.ollTrack("workout_return_7d", "workout");
    } else {
      state.history[existing] = active;
    }
    state.active = null;
    state.restUntil = 0;
    if (save()) $("notice").textContent = "Workout saved.";
    render();
    $("history").scrollIntoView({ block: "start" });
    $("summary").focus();
  }

  function renderSession() {
    const panel = $("session");
    const active = state.active;
    panel.hidden = !active;
    panel.replaceChildren();
    if (!active) return;

    const title = node("h2", "Session in progress");
    title.id = "session-title";
    title.tabIndex = -1;
    const settings = node("div", "", "fitness-row");
    const name = input("text", active.name, { maxLength: 80, required: true });
    const date = input("date", active.date, { required: true });
    const unit = select([["kg", "kg"], ["lb", "lb"]], active.unit);
    name.addEventListener("change", () => {
      active.name = name.value.trim() || active.name;
      name.value = active.name;
      save();
    });
    date.addEventListener("change", () => {
      if (validDate(date.value)) active.date = date.value;
      date.value = active.date;
      save();
    });
    unit.addEventListener("change", () => {
      const factor = unit.value === "lb" ? 1 / .45359237 : .45359237;
      const convert = (weight) => Math.min(9999, Math.round(weight * factor * 100) / 100);
      for (const item of active.items) {
        if (item.kind !== "strength") continue;
        item.load = convert(item.load);
        item.sets.filter(Boolean).forEach((set) => { set.weight = convert(set.weight); });
      }
      active.unit = state.unit = unit.value;
      save();
      renderSession();
    });
    settings.append(field("Workout name", name), field("Date", date), field("Weight unit", unit));
    const timer = node("p", timerLabel(), "timer");
    timer.id = "rest-timer";
    const timerRow = node("div", "", "fitness-row");
    timerRow.append(timer, button("Skip rest", () => {
      state.restUntil = 0;
      save();
      updateTimer();
    }));
    panel.append(title, settings, timerRow);

    for (const item of active.items) {
      const block = node("article", "", "exercise");
      const heading = node("div", "", "fitness-row");
      heading.append(node("h3", item.name), button("Remove", () => {
        if (!confirm(`Remove ${item.name} from this session?`)) return;
        active.items.splice(active.items.indexOf(item), 1);
        save();
        renderSession();
      }));
      block.append(heading);
      if (item.kind === "strength") renderStrength(item, active, block);
      else renderCardio(item, block);
      panel.append(block);
    }

    const add = node("form", "", "fitness-add");
    const exercise = input("text", "", { required: true, maxLength: 80 });
    const kind = select([["strength", "Resistance"], ["cardio", "Cardio"]], "strength");
    const submit = node("button", "Add exercise");
    submit.type = "submit";
    submit.disabled = active.items.length >= 40;
    add.append(field("Exercise name", exercise), field("Type", kind), submit);
    add.addEventListener("submit", (event) => {
      event.preventDefault();
      const label = exercise.value.trim();
      if (!label || active.items.length >= 40) return;
      active.items.push(kind.value === "cardio" ? cardio(label) : strength(label, active));
      save();
      renderSession();
      panel.querySelector(".fitness-add input").focus();
    });
    const actions = node("div", "", "fitness-row");
    actions.append(button("Finish workout", finish, true), button("Discard session", () => {
      if (!confirm("Discard changes to this workout?")) return;
      state.active = null;
      state.restUntil = 0;
      save();
      render();
      $("custom").focus();
    }));
    const status = node("p");
    status.id = "session-status";
    status.setAttribute("role", "status");
    panel.append(add, actions, status);
  }

  function renderProgress(history) {
    const holder = $("progress");
    const selected = holder.querySelector("select")?.value;
    const lifts = new Map();
    for (const entry of history) {
      for (const item of entry.items) {
        if (item.kind !== "strength") continue;
        const set = item.sets.slice(2).filter(Boolean).sort((a, b) => b.weight - a.weight || b.reps - a.reps)[0];
        if (!set) continue;
        const key = item.name.toLowerCase();
        if (!lifts.has(key)) lifts.set(key, { name: item.name, sessions: [] });
        lifts.get(key).sessions.push({ date: entry.date, unit: entry.unit, ...set });
      }
    }
    holder.replaceChildren();
    if (!lifts.size) return;
    const names = [...lifts].sort((a, b) => a[1].name.localeCompare(b[1].name));
    const picker = select(names.map(([key, lift]) => [key, lift.name]), lifts.has(selected) ? selected : names[0][0]);
    const results = node("ul");
    const update = () => {
      results.replaceChildren(...lifts.get(picker.value).sessions.slice(0, 8).map((set) =>
        node("li", `${set.date} · ${set.weight ? set.weight + " " + set.unit : "Bodyweight"} × ${set.reps} reps`)));
    };
    picker.addEventListener("change", update);
    holder.append(node("h3", "Exercise progress"), field("Exercise", picker), node("p", "Heaviest working set from each recent session.", "fitness-note"), results);
    update();
  }

  function renderHistory() {
    const history = sortedHistory();
    renderProgress(history);
    const recent = history.filter((entry) => {
      const age = distance(entry.date, dateKey());
      return age >= 0 && age < 7;
    });
    const minutes = recent.flatMap((entry) => entry.items).reduce((total, item) => total + (item.kind === "cardio" ? item.minutes : 0), 0);
    $("summary").tabIndex = -1;
    $("summary").textContent = history.length ? `Last 7 days · ${recent.length} workouts · ${Math.round(minutes * 10) / 10} cardio minutes` : "Your saved workouts will appear here.";
    $("entries").replaceChildren(...history.map((entry) => {
      const group = node("details", "", "history-entry");
      group.append(node("summary", `${entry.date} · ${entry.name}`));
      for (const item of entry.items) {
        const logged = item.kind === "cardio"
          ? item.minutes ? `${item.minutes} min${item.zone ? " · Zone " + item.zone : ""}` : ""
          : item.sets.map((set, index) => set && `${sets[index].name}: ${set.weight ? set.weight + " " + entry.unit : "Bodyweight"} × ${set.reps}`).filter(Boolean).join(" · ");
        if (logged) group.append(node("p", `${item.name} · ${logged}`));
      }
      const controls = node("div", "", "fitness-row");
      const edit = button("Edit workout", () => {
        state.active = structuredClone(entry);
        state.restUntil = 0;
        save();
        render();
        showSession();
      });
      const repeat = button("Repeat workout", () => {
        const active = { id: crypto.randomUUID(), name: entry.name, date: dateKey(), unit: entry.unit, items: [] };
        active.items = entry.items.map((item) => item.kind === "cardio" ? cardio(item.name, item.target) : strength(item.name, active));
        state.active = active;
        state.restUntil = 0;
        save();
        window.ollTrack("workout_start", "workout");
        render();
        showSession();
      });
      edit.disabled = repeat.disabled = Boolean(state.active);
      controls.append(edit, repeat);
      group.append(controls);
      return group;
    }));
  }

  function render() {
    renderPlan();
    renderSession();
    renderHistory();
  }

  $("equipment").addEventListener("change", (event) => {
    state.equipment = event.target.value;
    save();
    renderPlan();
  });
  $("start-date").addEventListener("change", (event) => {
    if (validDate(event.target.value)) state.start = event.target.value;
    save();
    renderPlan();
  });
  $("custom").addEventListener("click", () => start("Custom workout"));
  $("export").addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
    const link = node("a");
    link.href = url;
    link.download = `oll-workouts-${dateKey()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $("restore").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      if (!validBackup(backup)) throw new Error("Invalid backup");
      if ((state.active || state.history.length) && !confirm("Replace the workouts and current session on this device with this backup?")) return;
      state = backup;
      if (save()) $("notice").textContent = "Workout backup restored.";
      render();
    } catch {
      $("notice").textContent = "This file is not a valid OLL workout backup.";
    }
  });
  render();
  setInterval(updateTimer, 1000);
})();
