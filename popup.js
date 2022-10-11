const textarea = document.getElementById("textarea");
let darkIcon;

/* Functions */

function adjustHeight() {
	textarea.style.height = "5px";
    textarea.style.height = Math.max((textarea.scrollHeight), 25) + "px";
}
function setIcon() {
	chrome.action.setIcon({path:"images/bulb" + (textarea.value === "" ? "Off" : "On") + (darkIcon ? "Dark" : "Light") + ".png"});
}


/* Load Data and Set Listeners */

chrome.storage.sync.get("note", function(result) {
	if (typeof result["note"] === "undefined") {
		textarea.value = "You can add your notes here!";
	} else {
		textarea.value = result["note"];
	}
});
chrome.storage.sync.get("place", function(result) {
	if (typeof result["place"] === "undefined") {
		textarea.selectionStart = textarea.selectionEnd = 0;
	} else {
		textarea.selectionStart = textarea.selectionEnd = result["place"];
	}
});
chrome.storage.sync.get("darkMode", function(result) {
	if (typeof result["darkMode"] !== "undefined" && result["darkMode"]) {
		textarea.classList.add("dark");
	}
});
chrome.storage.sync.get("darkIcon", function(result) {
	darkIcon = typeof result["darkIcon"] !== "undefined" && result["darkIcon"];
});
textarea.addEventListener("keydown", adjustHeight);
textarea.addEventListener("keyup", function() {
	adjustHeight();
	setIcon();
	const names = ["solve", "rand", "deriv", "d2h", "h2d", "d2b", "b2d", "b2h", "h2b", "help"];
	let end = textarea.value.substring(textarea.selectionStart,textarea.value.length).indexOf("\n")+textarea.selectionStart;
	if (end < textarea.selectionStart) {
		end = textarea.value.length;
	}
	check:
	for (let i = Math.max(0,textarea.value.substring(0,textarea.selectionStart).lastIndexOf("\n")); i < textarea.value.length - 6; i++) {
		for (let j = 0; j < names.length; j++) {
			if (textarea.value.substring(i, i + names[j].length + 1) === "/" + names[j]) {
				for (let k = i + names[j].length + 1; k < textarea.value.length && textarea.value[k] !== "\n"; k++) {
					if (textarea.value[k] === "=") {
						let ans;
						switch (j) {
							case 0://solve <equation> = simplification and expansion of equation
								ans = math.rationalize(textarea.value.substring(i + 6, k - 1));
								break;
							case 1://rand <low> <high> = random number between low and high
								let m;
								for (m = i + 6; textarea.value[m] !== " "; m++) {}
								ans = Math.floor(Math.random() * (textarea.value.substring(m + 1, k - 1) - textarea.value.substring(i + 6, m) + 1)) + parseInt(textarea.value.substring(i + 6, m));
								break;
							case 2://deriv <equation> = derivative of equation with respect to x
								ans = math.derivative(textarea.value.substring(i + 7, k - 1), "x");
								break;
							case 3://d2h <number> = base conversion of number
								ans = parseInt(textarea.value.substring(i + 5, k - 1)).toString(16).toUpperCase();
								break;
							case 4://h2d <number> = base conversion of number
								ans = parseInt(textarea.value.substring(i + 5, k - 1), 16);
								break;
							case 5://d2b <number> = base conversion of number
								ans = parseInt(textarea.value.substring(i + 5, k - 1)).toString(2);
								break;
							case 6://b2d <number> = base conversion of number
								ans = parseInt(textarea.value.substring(i + 5, k - 1), 2);
								break;
							case 7://b2h <number> = base conversion of number
								ans = parseInt(textarea.value.substring(i + 5, k - 1), 2).toString(16).toUpperCase();
								break;
							case 8://h2b <number> = base conversion of number
								ans = parseInt(textarea.value.substring(i + 5, k - 1), 16).toString(2)
								break;
							case 9://help = list of commands
								ans = 'use "/" + any command:\n  solve <equation> = simplification and expansion of equation\n  rand <low> <high> = random number between low and high\n  deriv <equation> = derivative of equation with respect to x\n  d2h, h2d, d2b, b2d, b2h, or h2b <number> = base conversion of number\n  Note: trig functions use radians. Multiply by 3.14/180 to use degrees';
						}
						textarea.value = textarea.value.substring(0, i) + textarea.value.substring(i + 1, k + 1) + " " + ans + textarea.value.substring(k + 1, textarea.value.length);
						textarea.selectionStart = textarea.selectionEnd = k + ans.toString().length + 1;
						adjustHeight();
						break check;
					}
				}
			}
		}
	}
	chrome.storage.sync.set({["note"]: textarea.value});
	chrome.storage.sync.set({["place"]: textarea.selectionStart});
});
textarea.addEventListener("click", function() {
	chrome.storage.sync.set({["place"]: textarea.selectionStart});
});


/* Run on Load */

window.onload = (event) => {
	adjustHeight();
	setIcon();
};
