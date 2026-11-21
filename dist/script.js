document.querySelectorAll("[data-year]").forEach((year) => {
  year.textContent = new Date().getFullYear();
});

const toolsMenu = document.querySelector(".tools-disclosure");

if (toolsMenu) {
  const summary = toolsMenu.querySelector("summary");

  document.addEventListener("click", (event) => {
    if (!toolsMenu.contains(event.target)) toolsMenu.open = false;
  });

  toolsMenu.addEventListener("focusout", (event) => {
    if (!toolsMenu.contains(event.relatedTarget)) toolsMenu.open = false;
  });

  toolsMenu.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !toolsMenu.open) return;

    event.preventDefault();
    toolsMenu.open = false;
    summary.focus();
  });
}

const explorer = document.querySelector("[data-product-explorer]");

if (explorer) {
  const picker = explorer.querySelector(".product-picker");
  const tabs = Array.from(picker.querySelectorAll("button"));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

  function selectProduct(selectedIndex) {
    tabs.forEach((tab, index) => {
      const selected = index === selectedIndex;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[index].hidden = !selected;
    });
  }

  picker.setAttribute("role", "tablist");
  tabs.forEach((tab, index) => {
    tab.setAttribute("role", "tab");
    panels[index].setAttribute("role", "tabpanel");
    panels[index].setAttribute("aria-labelledby", tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener("click", () => selectProduct(index));
  });

  picker.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(event.target);
    if (index < 0) return;

    let nextIndex;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % tabs.length;
        break;
      case "ArrowLeft":
        nextIndex = (index + tabs.length - 1) % tabs.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectProduct(nextIndex);
    tabs[nextIndex].focus();
  });

  selectProduct(0);
  picker.hidden = false;
}
