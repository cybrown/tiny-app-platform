(async () => {
  const data = await (await fetch("https://www.example.com")).text();
  document.querySelector(".x-content").textContent = data;
})();
