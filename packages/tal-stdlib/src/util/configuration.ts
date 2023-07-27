export let backendUrl = "";

try {
  backendUrl = (window as any).electronAPI.config().backendUrl;
} catch (err) {
  console.log("failed to initialize config event");
}
