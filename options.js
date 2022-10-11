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

const darkIcon = document.getElementById("darkIcon");
chrome.storage.sync.get("darkIcon", function(result) {
	if (typeof result["darkIcon"] !== "undefined") {
		if (result["darkIcon"]) {
			darkIcon.checked = true;
			document.body.classList.add("dark");
		} else {
			darkIcon.checked = false;
		}
	}
});
darkIcon.addEventListener("click", function() {
	chrome.storage.sync.set({["darkIcon"]: (darkIcon.checked ? 1 : 0)});
	chrome.storage.sync.get("note", function(result) {
		chrome.action.setIcon({path:"images/bulb" + ((typeof result["note"] === "undefined" || result["note"] === "") ? "Off" : "On") + (darkIcon.checked ? "Dark" : "Light") + ".png"});
	});
});
