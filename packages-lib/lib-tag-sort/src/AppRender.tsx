/* @refresh reload */
import { render } from "solid-js/web";

import App from "./tsx/App";

const HOST_ID = "root";

function ensureHost() {
	const existing = document.getElementById(HOST_ID);
	if (existing)
		return existing;

	const host = document.createElement("div");
	host.id = HOST_ID;
	document.body.appendChild(host);
	return host;
}

export function mountApp() {
	const host = ensureHost();
	render(() => <App />, host);
}
