const textarea = document.getElementById('textarea');
let darkIcon;
let lastKey = Date.now();
let saved = 1;



/* Functions */

function adjustHeight() {
	textarea.style.height = '5px';
    textarea.style.height = Math.max((textarea.scrollHeight), 25) + 'px';
}
function setIcon() {
	chrome.action.setIcon({path:'images/bulb' + (textarea.value === '' ? 'Off' : 'On') + (darkIcon ? 'Dark' : 'Light') + '.png'});
}



/* Load Data */

chrome.storage.sync.get('darkMode', function(result) {
	if (typeof result['darkMode'] !== 'undefined' && result['darkMode']) {
		textarea.classList.add('dark');
	}
});
chrome.storage.sync.get('darkIcon', function(result) {
	darkIcon = typeof result['darkIcon'] !== 'undefined' && result['darkIcon'];
});
function loadData(name, nameDate) {
	return Promise.all([chrome.storage.local.get([name, nameDate]), chrome.storage.sync.get([name, nameDate])]).then(result => {
		if (typeof result[0][name] === 'undefined' && typeof result[1][name] === 'undefined') {
			return 'You can add your notes here!';
		} else if (typeof result[0][name] === 'undefined' || typeof result[0][nameDate] === 'undefined') {
			return result[1][name];
		} else if (typeof result[1][name] === 'undefined' || typeof result[1][nameDate] === 'undefined') {
			return result[0][name];
		} else if (result[0][nameDate] > result[1][nameDate]) {
			return result[0][name];
		} else {
			return result[1][name];
		}
		
	});
}
loadData('note', 'noteDate', 'value').then(value => {
	textarea.value = value;
});
loadData('place', 'placeDate', 'selectionStart').then(value => {
	textarea.selectionStart = textarea.selectionEnd = value;
});



/* Set Listeners */

textarea.addEventListener('keydown', adjustHeight);
textarea.addEventListener('keyup', function(e) {
	adjustHeight();
	setIcon();
	const names = ['solve', 'rand', 'deriv', 'd2h', 'h2d', 'd2b', 'b2d', 'b2h', 'h2b', 'help'];
	let end = textarea.value.substring(textarea.selectionStart,textarea.value.length).indexOf('\n')+textarea.selectionStart;
	if (end < textarea.selectionStart) {
		end = textarea.value.length;
	}
	check:
	for (let i = Math.max(0,textarea.value.substring(0,textarea.selectionStart).lastIndexOf('\n')); i < textarea.value.length - 6; i++) {
		for (let j = 0; j < names.length; j++) {
			if (textarea.value.substring(i, i + names[j].length + 1) === '/' + names[j]) {
				for (let k = i + names[j].length + 1; k < textarea.value.length && textarea.value[k] !== '\n'; k++) {
					if (textarea.value[k] === '=') {
						let ans;
						switch (j) {
							case 0://solve <equation> = simplification and expansion of equation
								ans = math.rationalize(textarea.value.substring(i + 6, k - 1));
								break;
							case 1://rand <low> <high> = random number between low and high
								let m;
								for (m = i + 6; textarea.value[m] !== ' '; m++) {}
								ans = Math.floor(Math.random() * (textarea.value.substring(m + 1, k - 1) - textarea.value.substring(i + 6, m) + 1)) + parseInt(textarea.value.substring(i + 6, m));
								break;
							case 2://deriv <equation> = derivative of equation with respect to x
								ans = math.derivative(textarea.value.substring(i + 7, k - 1), 'x');
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
								ans = parseInt(textarea.value.substring(i + 5, k - 1), 16).toString(2);
								break;
							case 9://help = list of commands
								ans = 'use '/' + any command:\n  solve <equation> = simplification and expansion of equation\n  rand <low> <high> = random number between low and high\n  deriv <equation> = derivative of equation with respect to x\n  d2h, h2d, d2b, b2d, b2h, or h2b <number> = base conversion of number\n  Note: trig functions use radians. Multiply by 3.14/180 to use degrees';
						}
						textarea.value = textarea.value.substring(0, i) + textarea.value.substring(i + 1, k + 1) + ' ' + ans + textarea.value.substring(k + 1, textarea.value.length);
						textarea.selectionStart = textarea.selectionEnd = k + ans.toString().length + 1;
						adjustHeight();
						break check;
					}
				}
			}
		}
	}
	chrome.storage.local.set({['note']: textarea.value});
	chrome.storage.local.set({['noteDate']: Date.now()});
	chrome.storage.local.set({['place']: textarea.selectionStart});
	chrome.storage.local.set({['placeDate']: Date.now()});
	lastKey = Date.now();
	saved = 0;
});
textarea.addEventListener('click', function() {
	chrome.storage.local.set({['place']: textarea.selectionStart});
	chrome.storage.local.set({['placeDate']: Date.now()});
});
setInterval(function() {
	if (!saved && Date.now() - lastKey > 2000) {
		saved = 1;
		chrome.storage.sync.set({['note']: textarea.value});
		chrome.storage.sync.set({['noteDate']: Date.now()});
		chrome.storage.sync.set({['place']: textarea.selectionStart});
		chrome.storage.sync.set({['placeDate']: Date.now()});
	}
}, 1000);


/* Run on Load */

window.onload = (event) => {
	adjustHeight();
	setIcon();
};
