(() => {
  const week = [
    { name: "Light cardio", cardio: "60 min · Zone 2–3", gym: ["Easy jog"], home: ["Easy jog"] },
    { name: "Legs", gym: ["Squat", "Romanian deadlift", "Leg extension", "Leg curl", "Calf raise"], home: ["Goblet squat", "Dumbbell Romanian deadlift", "Band leg extension", "Band leg curl", "Standing calf raise"] },
    { name: "Rest", gym: [], home: [] },
    { name: "Chest, back & core", gym: ["Incline press", "Flat bench press", "Cable fly", "Lat pulldown", "Seated row", "Straight-arm pulldown", "Leg raise"], home: ["Dumbbell floor press", "Push-up", "Band fly", "Band pulldown", "Dumbbell row", "Band straight-arm pulldown", "Leg raise"] },
    { name: "Steady cardio", cardio: "25–30 min · High Zone 3 to Zone 4", gym: ["Bike"], home: ["Run"] },
    { name: "Shoulders, arms & core", gym: ["Overhead press", "Lateral raise", "Rear-delt fly", "Dumbbell curl", "Hammer curl", "Triceps pressdown", "Overhead cable triceps extension", "Reverse crunch"], home: ["Dumbbell overhead press", "Dumbbell lateral raise", "Band rear-delt fly", "Dumbbell curl", "Dumbbell hammer curl", "Band triceps pressdown", "Overhead dumbbell triceps extension", "Reverse crunch"] },
    { name: "Cardio intervals", cardio: "6–17 min of hard effort · High Zone 4 to Zone 5", gym: ["Bike intervals"], home: ["Running intervals"] }
  ];

  const sets = [
    { name: "Warm-up 1", factor: .4, reps: "6–10", rest: "1–2 min" },
    { name: "Warm-up 2", factor: .65, reps: "4–8", rest: "2 min" },
    { name: "Working set 1", factor: 1, reps: "6–12", rest: "2–3 min" },
    { name: "Working set 2", factor: 1, reps: "6–12", rest: "2–3 min" }
  ];
  const dayDetails = [
    { type: "Cardio", description: "Keep a steady, sustainable pace." },
    { type: "Strength", description: "Start with the compound lifts, then finish with isolation work.", targets: ["Quad compound", "Hamstrings and glutes · hip hinge", "Quad isolation", "Hamstring isolation", "Calves"] },
    { type: "Recovery", description: "Keep your walking easy." },
    { type: "Strength", description: "Pair chest presses with upper-body pulls, then finish with a core exercise.", targets: ["Upper-chest press", "Horizontal chest press", "Chest isolation", "Vertical pull", "Horizontal pull", "Lats · straight-arm motion", "Core · leg or knee raise"] },
    { type: "Cardio", description: "Hold a steady effort in the target zone." },
    { type: "Strength", description: "Start with the shoulder press. Finish with core.", targets: ["Shoulder press", "Side delts", "Rear delts", "Biceps isolation", "Elbow flexors", "Triceps isolation", "Triceps isolation · overhead", "Core"] },
    { type: "Cardio", description: "Warm up, alternate short hard efforts with recovery, then cool down. Count only the hard efforts toward the target." }
  ];
  const gymSubstitutions = [
    [["Incline treadmill walk", "Elliptical", "Steady swim"]],
    [
      ["Leg press", "Step-up", "Bulgarian split squat"],
      ["Good morning", "Cable pull-through", "Dumbbell single-leg deadlift"],
      ["Reverse Nordic curl", "Supported sissy squat", "Seated ankle-weight knee extension"],
      ["Slider hamstring curl", "Stability-ball hamstring curl", "Assisted Nordic hamstring curl"],
      ["Seated calf raise", "Donkey calf raise", "Single-leg calf raise off a step"]
    ],
    [],
    [
      ["Incline dumbbell press", "Low-to-high cable press", "Feet-elevated push-up"],
      ["Flat dumbbell press", "Machine chest press", "Banded chest press"],
      ["Pec deck fly", "Dumbbell chest fly", "Slider chest fly"],
      ["Assisted pull-up", "Neutral-grip pull-up", "Kneeling single-arm cable pulldown"],
      ["Chest-supported row", "Inverted row", "One-arm band row"],
      ["Dumbbell pullover", "Machine pullover", "Lying band pullover"],
      ["Captain’s chair knee raise", "Hanging knee tuck", "Bent-knee lying raise"]
    ],
    [["Rowing machine", "Stair climber", "Continuous swim"]],
    [
      ["Landmine press", "Machine shoulder press", "Pike push-up"],
      ["Cable lateral raise", "Machine lateral raise", "Band lateral raise"],
      ["Reverse pec deck", "Cable rear-delt fly", "Rear-delt row"],
      ["EZ-bar curl", "Cable curl", "Concentration curl"],
      ["Rope hammer curl", "Cross-body hammer curl", "Reverse EZ-bar curl"],
      ["Lying triceps extension", "Dumbbell triceps kickback", "Bodyweight triceps extension"],
      ["Seated EZ-bar overhead extension", "Overhead band triceps extension", "Single-arm kettlebell overhead extension"],
      ["Cable crunch", "Stability-ball crunch", "Curl-up"]
    ],
    [["Air bike intervals", "Rowing intervals", "Track sprint intervals"]]
  ];

  const homeSubstitutions = [
    [["Brisk uphill walk", "Easy cycling", "Steady swim"]],
    [
      ["Step-up", "Bulgarian split squat", "Dumbbell reverse lunge"],
      ["Band good morning", "Dumbbell single-leg deadlift", "Band pull-through"],
      ["Seated ankle-weight knee extension", "Reverse Nordic curl", "Supported sissy squat"],
      ["Slider hamstring curl", "Stability-ball hamstring curl", "Assisted Nordic hamstring curl"],
      ["Seated dumbbell calf raise", "Donkey calf raise", "Single-leg calf raise off a step"]
    ],
    [],
    [
      ["Incline dumbbell press", "Feet-elevated push-up", "Low-to-high band press"],
      ["Flat dumbbell press", "Standing band chest press", "Bent-knee push-up"],
      ["Dumbbell chest fly", "Slider chest fly", "Standing single-arm band fly"],
      ["Band-assisted pull-up", "Chin-up", "Half-kneeling single-arm band pulldown"],
      ["Chest-supported dumbbell row", "Inverted row", "One-arm band row"],
      ["Dumbbell pullover", "Lying band pullover", "Seated straight-arm band pulldown"],
      ["Bent-knee lying raise", "Seated knee tuck", "Hanging knee tuck"]
    ],
    [["Sustained uphill walk", "Steady jump rope", "Continuous swim"]],
    [
      ["Pike push-up", "Standing band shoulder press", "Single-arm kettlebell press"],
      ["Band lateral raise", "Side-lying dumbbell raise", "Lean-away dumbbell lateral raise"],
      ["Band face pull", "Rear-delt dumbbell row", "Side-lying rear-delt raise"],
      ["Concentration curl", "Standing band curl", "Dumbbell spider curl"],
      ["Cross-body hammer curl", "Band hammer curl", "Dumbbell reverse curl"],
      ["Dumbbell triceps kickback", "Lying dumbbell triceps extension", "Bodyweight triceps extension"],
      ["Overhead band triceps extension", "Single-arm kettlebell overhead extension", "Overhead bodyweight triceps extension"],
      ["Curl-up", "Stability-ball crunch", "Kneeling band crunch"]
    ],
    [["Hill cycling intervals", "Jump rope intervals", "Uphill sprint intervals"]]
  ];

  const dailyStepTarget = "8,000–10,000 steps";
  const $ = (id) => document.getElementById(id);
  const planOptions = Array.from(document.querySelectorAll("[data-plan-option]"));
  let equipment = planOptions.find(option => option.checked)?.value || "gym";
  const cardioCues = {
    0: "Keep the effort steady enough to talk comfortably.",
    4: "Aim for a sustained, brisk effort. At the harder end, expect to pause for breath after a few words.",
    6: "The hard intervals should feel very challenging. Give yourself time to catch your breath between efforts."
  };
  const strengthVideos = {
    1: ["Lower-body demonstrations", "day-2-major-lower-body-muscles"],
    3: ["Chest, back, and core demonstrations", "day-4-major-torso-muscles"],
    5: ["Shoulders and arms demonstrations", "day-7-shoulders-biceps-triceps"]
  };

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  const storageKey = "oll.workout.substitutions.v1";
  let choices = {};
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved === "object" && !Array.isArray(saved)) choices = saved;
  } catch {
    // The plan also works without access to browser storage.
  }

  function exerciseRow(original, dayIndex, exerciseIndex, target) {
    const alternatives = (equipment === "home" ? homeSubstitutions : gymSubstitutions)[dayIndex][exerciseIndex];
    const key = [equipment, dayIndex, exerciseIndex].join(":");
    const selected = alternatives.includes(choices[key]) ? choices[key] : original;
    const row = node("li");
    const select = node("select", "", "exercise-choice");
    select.setAttribute("aria-label", "Day " + (dayIndex + 1) + " · Exercise for " + original);
    const defaultOption = node("option", original);
    defaultOption.value = original;
    select.append(defaultOption);
    const group = node("optgroup");
    group.label = "Substitute with";
    for (const optionName of alternatives) {
      const option = node("option", optionName);
      option.value = optionName;
      group.append(option);
    }
    select.append(group);
    row.append(select);
    if (target) row.append(node("span", target));
    select.value = selected;
    select.addEventListener("change", () => {
      const isOriginal = select.value === original;
      if (isOriginal) delete choices[key];
      else choices[key] = select.value;
      try {
        localStorage.setItem(storageKey, JSON.stringify(choices));
      } catch {
        // Keep the selection in memory for this visit.
      }
    });
    return row;
  }

  function makeSetGuide() {
    const guide = node("details", "", "set-guide");
    const table = node("table");
    const head = node("thead");
    const headings = node("tr");
    for (const label of ["Set", "Load", "Reps", "Rest after"]) {
      const cell = node("th", label);
      cell.scope = "col";
      headings.append(cell);
    }
    head.append(headings);
    const body = node("tbody");
    for (const set of sets) {
      const row = node("tr");
      const name = node("th", set.name);
      name.scope = "row";
      row.append(name, node("td", Math.round(set.factor * 100) + "%"), node("td", set.reps), node("td", set.rest));
      body.append(row);
    }
    table.append(head, body);
    guide.append(node("summary", "Sets, reps, and rest"));
    const tableWrap = node("div", "", "set-guide-table");
    tableWrap.append(table);
    guide.append(tableWrap, node("p", "Choose a working weight you can lift for 6–12 controlled reps. For bodyweight warm-ups, use an easier variation.", "fitness-note"));
    return guide;
  }

  function renderPlan() {
    for (const option of planOptions) option.checked = option.value === equipment;
    trackerButton.textContent = "Get the " + (equipment === "home" ? "Home" : "Gym") + " workbook";
    $("home-equipment").hidden = equipment !== "home";
    const schedule = $("suggestions");
    const openDays = Array.from(schedule.children, card => ({
      day: card.open,
      sets: card.querySelector(".set-guide")?.open
    }));
    schedule.replaceChildren(...week.map((day, index) => {
      const details = dayDetails[index];
      const exercises = day[equipment];
      const card = node("details", "", "plan-day");
      card.open = openDays[index]?.day ?? index === 0;
      const summary = node("summary", "", "plan-day-heading");
      const heading = node("span", "", "plan-day-title");
      const target = day.cardio || (exercises.length ? "Strength · " + exercises.length + " exercises" : details.type);
      heading.append(node("span", day.name), node("span", target, "plan-day-type"));
      summary.append(node("span", "Day " + (index + 1), "plan-day-number"), heading);
      const body = node("div", "", "plan-day-body");
      if (index !== 0) body.append(node("p", details.description, "plan-day-description"));
      if (day.cardio) {
        const cue = node("p", cardioCues[index], "plan-effort");
        const source = node("a", "How to gauge effort");
        source.href = "https://www.cdc.gov/physical-activity-basics/measuring/index.html";
        cue.append(" ", source);
        body.append(cue);
      }
      if (details.type === "Strength") {
        const guide = makeSetGuide();
        guide.open = Boolean(openDays[index]?.sets);
        body.append(guide);
      }
      if (exercises.length) {
        const list = node(day.cardio ? "ul" : "ol", "", day.cardio ? "plan-exercises cardio-exercise" : "plan-exercises");
        exercises.forEach((exercise, exerciseIndex) => {
          list.append(exerciseRow(exercise, index, exerciseIndex, details.targets?.[exerciseIndex]));
        });
        body.append(list);
      }
      if (strengthVideos[index]) {
        const [title, anchor] = strengthVideos[index];
        const video = node("a", "Watch " + title.toLowerCase(), "plan-video");
        video.href = "https://www.hubermanlab.com/protocols-resources#" + anchor;
        body.append(video);
      }
      card.append(summary, body);
      return card;
    }));
  }

  $("daily-steps").textContent = dailyStepTarget;
  if (window.matchMedia("(max-width: 759px)").matches) document.querySelector(".training-terms").open = false;

  const trackerForm = $("tracker-request");
  const trackerStatus = $("tracker-status");
  const trackerButton = $("request-tracker");
  const trackerDownload = $("workbook-download");
  let workbookUrl;
  const trackerEndpoint = window.ollConfig?.trackerRequestEndpoint;
  let endpoint;
  try {
    const url = new URL(trackerEndpoint);
    if (url.origin === "https://script.google.com" && /^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname)) endpoint = url.href;
  } catch {
    // Leave the form unavailable until Google supplies a deployment URL.
  }
  if (endpoint && location.origin !== "null" && window.crypto?.getRandomValues) {
    trackerButton.disabled = false;
    trackerStatus.textContent = "";
  } else if (endpoint && location.origin === "null") {
    trackerStatus.textContent = "Open this page on the website to request the workbook.";
  }

  function postWorkbookRequest(fields, onResult) {
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("");
    const frame = node("iframe");
    frame.name = "oll-workbook-" + nonce;
    frame.title = "Workbook delivery response";
    frame.hidden = true;
    const request = node("form");
    request.hidden = true;
    request.method = "post";
    request.action = endpoint;
    request.target = frame.name;
    const parameters = { ...fields, marketingOptIn: "no", parentOrigin: location.origin, nonce };
    for (const [name, value] of Object.entries(parameters)) {
      const field = node("input");
      field.type = "hidden";
      field.name = name;
      field.value = value;
      request.append(field);
    }

    function finish(result) {
      clearTimeout(timeout);
      window.removeEventListener("message", receive);
      request.remove();
      frame.remove();
      onResult(result);
    }

    function receive(message) {
      const googleOrigin = /^https:\/\/(?:script\.google\.com|[a-z0-9.-]+\.googleusercontent\.com|googleusercontent\.com)$/i;
      if (!googleOrigin.test(message.origin) || message.data?.channel !== "oll-workbook" || message.data.nonce !== nonce) return;
      finish(message.data);
    }

    const timeout = setTimeout(() => finish({ status: "timeout" }), 30000);
    window.addEventListener("message", receive);
    document.body.append(frame, request);
    request.submit();
  }

  function showWorkbook(encoded, plan) {
    if (typeof encoded !== "string") return false;
    try {
      const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
      if (bytes[0] !== 80 || bytes[1] !== 75 || bytes[2] !== 3 || bytes[3] !== 4) return false;
      workbookUrl = URL.createObjectURL(new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }));
      trackerDownload.href = workbookUrl;
      trackerDownload.download = "oll-12-week-workout-" + plan.toLowerCase() + ".xlsx";
      trackerDownload.textContent = "Download the " + plan + " workbook (.xlsx)";
      trackerDownload.hidden = false;
      return true;
    } catch {
      return false;
    }
  }

  trackerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (trackerButton.disabled) return;
    const email = trackerForm.elements.email.value.trim();
    const fields = { email, equipment };
    const plan = equipment === "home" ? "Home" : "Gym";
    if (workbookUrl) URL.revokeObjectURL(workbookUrl);
    workbookUrl = undefined;
    trackerDownload.hidden = true;
    trackerDownload.removeAttribute("href");
    trackerButton.disabled = true;
    trackerStatus.textContent = "Preparing your " + plan + " workbook…";
    postWorkbookRequest({ ...fields, delivery: "download" }, (result) => {
      trackerButton.disabled = false;
      if (result.status === "ready" && showWorkbook(result.workbook, plan)) {
        trackerStatus.textContent = "Your " + plan + " workbook is ready.";
        if (trackerForm.elements.email.value.trim() === email) trackerForm.elements.email.value = "";
        postWorkbookRequest({ ...fields, delivery: "email-copy" }, () => {});
      } else if (result.status === "sent") {
        trackerStatus.textContent = "Check your inbox for the " + plan + " workbook.";
        if (trackerForm.elements.email.value.trim() === email) trackerForm.elements.email.value = "";
      } else if (result.status === "invalid") {
        trackerStatus.textContent = "Check your email address and try again.";
      } else if (result.status === "busy") {
        trackerStatus.textContent = "Workbook delivery is busy. Please try again later.";
      } else {
        trackerStatus.textContent = "We could not prepare your workbook. Please try again.";
      }
    });
  });

  for (const option of planOptions) {
    option.addEventListener("change", () => {
      equipment = option.value;
      renderPlan();
    });
  }
  renderPlan();
})();
