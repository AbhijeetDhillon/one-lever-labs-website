document.getElementById('year').textContent = new Date().getFullYear();

const toolsNav = document.querySelector(".tools-nav");
if (toolsNav) {
  toolsNav.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    toolsNav.classList.add("dismissed");
    toolsNav.querySelector("a").focus();
  });
  toolsNav.addEventListener("pointerleave", () => toolsNav.classList.remove("dismissed"));
  toolsNav.addEventListener("focusout", (event) => {
    if (!toolsNav.contains(event.relatedTarget)) toolsNav.classList.remove("dismissed");
  });
}
