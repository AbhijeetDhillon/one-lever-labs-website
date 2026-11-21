(() => {
  const config = window.ollConfig;
  const preference = "oll.analytics.consent";
  const events = new Set([
    "tools_nav_click", "workout_open", "ferna_store_click", "zonedin_store_click",
    "bmr_open", "bmr_calculate", "updates_signup"
  ]);

  function track(event, source) {
    if (!events.has(event) || !config.analyticsEndpoint) return;
    try {
      if (localStorage.getItem(preference) !== "yes") return;
      navigator.sendBeacon(config.analyticsEndpoint, JSON.stringify({ event, source }));
    } catch {
      // Logging a workout works even when analytics is unavailable.
    }
  }

  window.ollTrack = track;
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-event]");
    if (link) track(link.dataset.event, location.pathname.includes("/tools/") ? "tools" : "homepage");
  });

  document.querySelectorAll("[data-updates]").forEach((section) => {
    const source = section.dataset.updates;
    section.innerHTML = `
      <div class="updates-copy">
        <h2>Get OLL updates</h2>
        <p>New apps and tools, by email.</p>
      </div>
      <div class="updates-action"></div>`;
    const action = section.querySelector(".updates-action");

    if (config.signupEndpoint) {
      action.innerHTML = `
        <form method="post">
          <div class="updates-fields">
            <label>Email <input type="email" name="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required></label>
            <button class="button" type="submit">Subscribe</button>
          </div>
          <p class="updates-status" role="status"></p>
        </form>`;
      const form = action.querySelector("form");
      const button = form.querySelector("button");
      const status = form.querySelector("[role=status]");
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (button.disabled) return;

        button.disabled = true;
        status.textContent = "Subscribing…";
        try {
          const response = await fetch(config.signupEndpoint, {
            method: "POST", credentials: "omit", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.elements.email.value.trim() })
          });
          const result = await response.json();
          if (!response.ok || result.ok !== true) {
            status.textContent = result.error || "Signup couldn’t be confirmed. Try again shortly.";
            return;
          }

          status.textContent = "You’re subscribed.";
          form.reset();
          track("updates_signup", source);
        } catch {
          status.textContent = "Signup couldn’t be confirmed. Try again shortly.";
        } finally {
          button.disabled = false;
        }
      });
    } else {
      action.textContent = "Signup is unavailable right now.";
    }

    if (config.analyticsEndpoint) {
      const label = document.createElement("label");
      label.className = "oll-analytics";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      label.append(checkbox, " Share usage events to help improve OLL. Workout details and email stay out of analytics.");
      section.append(label);
      try {
        checkbox.checked = localStorage.getItem(preference) === "yes";
        checkbox.addEventListener("change", () => localStorage.setItem(preference, checkbox.checked ? "yes" : "no"));
      } catch {
        checkbox.disabled = true;
      }
    }
  });
})();
