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
        <p>Get an email when we launch a new app or tool.</p>
      </div>
      <div class="updates-action"></div>`;
    const action = section.querySelector(".updates-action");

    if (config.signupEndpoint) {
      action.innerHTML = `
        <form>
          <div class="updates-fields">
            <label>Email address <input type="email" name="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required></label>
            <button class="button" type="submit">Sign up</button>
          </div>
          <label class="updates-consent"><input type="checkbox" required> Send me OLL product announcements.</label>
          <p class="updates-status" role="status"></p>
        </form>`;
      const form = action.querySelector("form");
      const button = form.querySelector("button");
      const status = form.querySelector("[role=status]");
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        button.disabled = true;
        status.textContent = "Submitting…";
        try {
          const response = await fetch(config.signupEndpoint, {
            method: "POST", credentials: "omit", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.elements.email.value.trim(), source, consent: true })
          });
          if (!response.ok) throw new Error("Signup failed");
          status.textContent = "Check your inbox to confirm your signup.";
          form.reset();
          track("updates_signup", source);
        } catch {
          status.textContent = "Signup could not be submitted. Please try again.";
        } finally {
          button.disabled = false;
        }
      });
    } else {
      const link = document.createElement("a");
      link.className = "button";
      link.textContent = config.signupFormUrl ? "Sign up for updates" : "Request updates by email";
      link.href = config.signupFormUrl || "mailto:abhijeet@oneleverlabs.com?subject=OLL%20product%20updates&body=Please%20email%20me%20about%20new%20One%20Lever%20Labs%20apps%20and%20tools.";
      action.append(link);
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
