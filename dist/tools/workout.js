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
  const equipment = $("equipment");

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
    const alternatives = (equipment.value === "home" ? homeSubstitutions : gymSubstitutions)[dayIndex][exerciseIndex];
    const key = [equipment.value, dayIndex, exerciseIndex].join(":");
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

  function renderPlan() {
    $("tracker-plan").textContent = "Selected plan: " + (equipment.value === "home" ? "Home" : "Gym");
    $("suggestions").replaceChildren(...week.map((day, index) => {
      const details = dayDetails[index];
      const card = node("article", "", "suggestion plan-day");
      const heading = node("div", "", "plan-day-heading");
      heading.append(node("p", "Day " + (index + 1), "plan-day-number"), node("span", details.type, "plan-day-type"));
      card.append(heading, node("h3", day.name), node("p", details.description, "plan-day-description"));
      const exercises = day[equipment.value];
      if (day.cardio) card.append(node("p", day.cardio, "plan-prescription"));
      if (exercises.length) {
        const list = node(day.cardio ? "ul" : "ol", "", day.cardio ? "plan-exercises cardio-exercise" : "plan-exercises");
        exercises.forEach((exercise, exerciseIndex) => {
          list.append(exerciseRow(exercise, index, exerciseIndex, details.targets?.[exerciseIndex]));
        });
        card.append(list);
        if (!day.cardio) card.append(node("p", "Per exercise · 2 warm-up sets, 2 working sets", "plan-prescription"));
      }
      card.append(node("p", dailyStepTarget, "plan-steps"));
      return card;
    }));
  }

  $("set-guide-rows").replaceChildren(...sets.map((set) => {
    const row = node("tr");
    const name = node("th", set.name);
    name.scope = "row";
    row.append(name, node("td", Math.round(set.factor * 100) + "%"), node("td", set.reps), node("td", set.rest));
    return row;
  }));

  if (window.matchMedia("(max-width: 759px)").matches) document.querySelector(".training-terms").open = false;

  const trackerForm = $("tracker-request");
  const trackerStatus = $("tracker-status");
  const trackerButton = $("request-tracker");
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

  trackerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (trackerButton.disabled) return;

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
    const fields = {
      email: trackerForm.elements.email.value.trim(),
      equipment: equipment.value,
      marketingOptIn: "no",
      parentOrigin: location.origin,
      nonce
    };
    for (const [name, value] of Object.entries(fields)) {
      const field = node("input");
      field.type = "hidden";
      field.name = name;
      field.value = value;
      request.append(field);
    }

    function finish(status) {
      clearTimeout(timeout);
      window.removeEventListener("message", receive);
      request.remove();
      frame.remove();
      trackerButton.disabled = false;
      if (status === "sent") {
        trackerStatus.textContent = "Your workbook was sent. Check your inbox.";
        trackerForm.reset();
      } else if (status === "invalid") {
        trackerStatus.textContent = "Check your email address and try again.";
      } else if (status === "busy") {
        trackerStatus.textContent = "Workbook delivery is busy. Please try again later.";
      } else {
        trackerStatus.textContent = "We could not confirm delivery. Please try again.";
      }
    }

    function receive(message) {
      const googleOrigin = /^https:\/\/(?:script\.google\.com|[a-z0-9.-]+\.googleusercontent\.com|googleusercontent\.com)$/i;
      if (!googleOrigin.test(message.origin) || message.data?.channel !== "oll-workbook" || message.data.nonce !== nonce) return;
      finish(message.data.status);
    }

    trackerButton.disabled = true;
    trackerStatus.textContent = "Sending your workbook…";
    const timeout = setTimeout(() => finish("timeout"), 30000);
    window.addEventListener("message", receive);
    document.body.append(frame, request);
    request.submit();
  });

  equipment.addEventListener("change", renderPlan);
  renderPlan();
})();
