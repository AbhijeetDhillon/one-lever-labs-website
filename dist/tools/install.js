(() => {
  const install = document.getElementById("install");
  let prompt;
  window.addEventListener("beforeinstallprompt", (event) => {
    if (!install) return;
    event.preventDefault();
    prompt = event;
    install.hidden = false;
  });
  install?.addEventListener("click", async () => {
    if (!prompt) return;
    const available = prompt;
    prompt = null;
    install.hidden = true;
    await available.prompt();
  });
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
