(() => {
  const $ = (id) => document.getElementById(id);
  const activities = [
    { name: "Sedentary", factor: 1.2, description: "Most of the day is spent sitting, with short walks for daily tasks and no planned exercise. Think desk work, a commute, and a few errands." },
    { name: "Lightly active", factor: 1.375, description: "You spend a meaningful part of the day walking or on your feet, usually around 7,000–10,000 steps. Think a walking commute or errands on foot, with no dedicated workout." },
    { name: "Moderately active", factor: 1.55, description: "You walk about 7,000–10,000 steps through the day and do a dedicated easy cardio session, such as a relaxed jog or bike ride at a pace where you can hold a conversation." },
    { name: "Very active", factor: 1.75, description: "You walk about 7,000–10,000 steps and complete one demanding workout, such as a challenging lifting session, a hard run, or cardio intervals." },
    { name: "Extremely active", factor: 1.9, description: "You stay on your feet or walk regularly and do two purposeful workouts in the same day. Think a challenging morning lifting session and a separate evening cardio workout." }
  ];
  const activityOptions = $("activity-options");
  activities.forEach((activity, index) => {
    const label = document.createElement("label");
    label.className = "activity-option";
    const control = document.createElement("input");
    control.type = "radio";
    control.name = "activity";
    control.value = index;
    control.required = true;
    control.setAttribute("aria-labelledby", "activity-name-" + index);
    control.setAttribute("aria-describedby", "activity-description-" + index);
    const content = document.createElement("span");
    const heading = document.createElement("span");
    heading.className = "activity-title";
    const title = document.createElement("strong");
    title.id = "activity-name-" + index;
    title.textContent = activity.name;
    const factor = document.createElement("span");
    factor.textContent = activity.factor + "×";
    heading.append(title, factor);
    const description = document.createElement("span");
    description.id = "activity-description-" + index;
    description.className = "activity-description";
    description.textContent = activity.description;
    content.append(heading, description);
    label.append(control, content);
    activityOptions.append(label);
  });
  const form = $("calculator");
  const read = (id) => $(id).valueAsNumber;
  const format = (value, digits) => new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(value);

  function range(values, suffix, digits = 0) {
    const numbers = values.map((value) => format(value, digits));
    return numbers.every((value) => value === numbers[0]) ? numbers[0] + suffix : numbers.join("–") + suffix;
  }

  function bodyFat() {
    if ($("method").value === "known") return [read("body-fat")];
    if ($("method").value === "range") {
      const low = read("fat-low");
      const high = read("fat-high");
      if (low > high) throw new Error("Enter a low body-fat estimate at or below the high estimate.");
      return [low, high];
    }
    return [caliperBodyFat()];
  }

  function caliperBodyFat() {
    const total = read("fold-a") + read("fold-b") + read("fold-c");
    const age = read("age");
    const density = $("equation").value === "male"
      ? 1.10938 - .0008267 * total + .0000016 * total ** 2 - .0002574 * age
      : 1.0994921 - .0009929 * total + .0000023 * total ** 2 - .0001392 * age;
    const estimate = 495 / density - 450;
    if (estimate < 1 || estimate > 80) throw new Error("These readings are outside the usable range. Check the sites, units, and measurements.");
    return estimate;
  }

  function updateCaliperEstimate() {
    if ($("method").value !== "caliper") return;
    const output = $("caliper-estimate");
    const inputs = ["age", "fold-a", "fold-b", "fold-c"].map($);
    if (inputs.some((field) => !field.value)) {
      output.textContent = "Enter your age and all three readings.";
      return;
    }
    if (inputs.some((field) => !field.validity.valid)) {
      output.textContent = "Check the age and millimeter readings.";
      return;
    }
    try {
      output.textContent = format(caliperBodyFat(), 1) + "%";
    } catch (error) {
      output.textContent = error.message;
    }
  }

  function updateInputs() {
    for (const method of ["known", "range", "caliper"]) {
      const inactive = $("method").value !== method;
      $(method).hidden = $(method).disabled = inactive;
    }
    const male = $("equation").value === "male";
    $("site-a").textContent = male ? "Chest (mm)" : "Triceps (mm)";
    $("site-b").textContent = male ? "Abdomen (mm)" : "Suprailiac (mm)";
    $("caliper-sites").textContent = male
      ? "Chest: diagonal, halfway from the front of the armpit to the nipple. Abdomen: vertical, about 2 cm right of the navel. Thigh: vertical, halfway between the hip crease and the top of the kneecap."
      : "Triceps: vertical, midway down the back of the upper arm. Suprailiac: diagonal, just above the hip bone near the front of your side. Thigh: vertical, halfway between the hip crease and the top of the kneecap.";
    updateCaliperEstimate();
  }

  function calculate() {
    const fat = bodyFat();
    const kg = read("weight") * ($("unit").value === "lb" ? .45359237 : 1);
    const lean = [...fat].reverse().map((percent) => kg * (1 - percent / 100));
    const basal = lean.map((mass) => 370 + 21.6 * mass);
    const index = Number(form.elements.activity.value);
    const lower = $("rest-day").checked || $("fat-loss").checked;
    const actual = activities[index];
    const target = activities[Math.max(0, index - Number(lower))];
    $("fat-used").textContent = range(fat, "%", 1);
    $("lean").textContent = range(lean, " kg", 1);
    $("bmr").textContent = range(basal, " kcal/day");
    $("maintenance").textContent = range(basal.map((value) => value * actual.factor), " kcal/day");
    $("target").textContent = range(basal.map((value) => value * target.factor), " kcal/day");
    $("tier-explanation").textContent = target !== actual
      ? `Target uses the ${target.name.toLowerCase()} tier (${target.factor}×), one tier below your selected activity.`
      : lower ? "Sedentary is the lowest tier. Your target uses the same multiplier as maintenance." : "Your target uses the same activity multiplier as maintenance.";
    $("result").hidden = false;
    $("empty-result").hidden = true;
  }

  $("equation").addEventListener("change", () => {
    $("fold-a").value = $("fold-b").value = "";
  });
  form.addEventListener("input", () => {
    updateCaliperEstimate();
    $("calc-error").hidden = true;
    $("result").hidden = true;
    $("empty-result").hidden = false;
  });
  form.addEventListener("change", updateInputs);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      calculate();
      window.ollTrack("bmr_calculate", "bmr");
      $("result-title").focus();
      $("result-title").scrollIntoView({ block: "nearest" });
    } catch (error) {
      $("calc-error").textContent = error.message;
      $("calc-error").hidden = false;
    }
  });
  const reference = window.ollConfig?.bodyFatReferenceUrl;
  if (reference) {
    $("body-fat-reference-link").href = reference;
    $("body-fat-reference").hidden = false;
  }
  $("rest-day").checked = new URLSearchParams(location.search).get("rest") === "1";
  updateInputs();
})();
