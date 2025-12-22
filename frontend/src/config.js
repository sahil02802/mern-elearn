export const DEMO_WAIT_SECONDS = 20;

export const applyRuntimeConfig = () => {
	if (typeof document === "undefined") return;
	document.documentElement.style.setProperty(
		"--demo-wait-duration",
		`${DEMO_WAIT_SECONDS}s`
	);
};
