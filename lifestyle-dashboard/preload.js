// Signale à la page qu'elle tourne dans l'appli desktop (pour la barre de titre macOS)
window.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("desktop-app");
  if (process.platform === "darwin") document.documentElement.classList.add("desktop-mac");
});
