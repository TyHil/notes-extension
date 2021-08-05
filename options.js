/*Run On Open*/

const darkMode = document.getElementById("darkMode");
chrome.storage.sync.get("darkMode", function(result) {
	if (typeof result["darkMode"] !== "undefined") {
		if (result["darkMode"]) {
			darkMode.checked = true;
			document.body.classList.add("dark");
		} else {
			darkMode.checked = false;
		}
	}
});
darkMode.addEventListener("click", function() {
	if (darkMode.checked) {
		document.body.classList.add("dark");
	} else {
		document.body.classList.remove("dark");
	}
	chrome.storage.sync.set({["darkMode"]: (darkMode.checked ? 1 : 0)});
});
