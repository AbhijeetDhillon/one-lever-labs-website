(() => {
  const config = window.ollConfig;
  const preference = "oll.analytics.consent";
  const events = new Set([
    "tools_nav_click", "workout_open", "ferna_store_click", "zonedin_store_click",
    "workout_start", "workout_save", "workout_return_7d", "updates_signup"
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
    if (link) track(link.dataset.event, "homepage");
  });

  document.querySelectorAll("[data-updates]").forEach((section) => {
    const source = section.dataset.updates;
    section.innerHTML = `
      <h2>Get OLL updates</h2>
      <p>Hear when One Lever Labs releases a new app or tool.</p>
      <form>
        <label>Email address <input type="email" name="email" autocomplete="email" required></label>
        <label><input type="checkbox" required> Email me about new OLL apps and tools.</label>
        <button type="submit">${config.signupEndpoint ? "Sign up" : "Open email to request updates"}</button>
        <p role="status"></p>
      </form>`;
    const form = section.querySelector("form");
    const status = form.querySelector("[role=status]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = form.elements.email.value.trim();
      if (!config.signupEndpoint) {
        const body = encodeURIComponent("Please email me about new One Lever Labs apps and tools.\nEmail: " + email);
        status.textContent = "Send the draft from your email app to request updates.";
        location.href = "mailto:abhijeet@oneleverlabs.com?subject=OLL%20product%20updates&body=" + body;
        return;
      }
      const button = form.querySelector("button");
      button.disabled = true;
      try {
        const response = await fetch(config.signupEndpoint, {
          method: "POST", credentials: "omit", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source, consent: true })
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
