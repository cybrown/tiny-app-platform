chrome.action.onClicked.addListener(async () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("/index.html") });
});
