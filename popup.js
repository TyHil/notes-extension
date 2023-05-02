const textarea = document.getElementById('textarea');
let darkIcon;
let lastKey = Date.now();
let saved = 1;



/* Functions */

function adjustHeight() {
	textarea.style.height = '5px';
    textarea.style.height = Math.max((textarea.scrollHeight), 25) + 'px';
}
function setIcon(value = textarea.value) {
	chrome.action.setIcon({path:'images/bulb' + (value === '' ? 'Off' : 'On') + (darkIcon ? 'Dark' : 'Light') + '.png'});
}



/* Load Data */

chrome.storage.sync.get('darkMode', function(result) {
	if (typeof result['darkMode'] !== 'undefined' && result['darkMode']) {
		textarea.classList.add('dark');
	}
});

function loadData(name, nameDate, fallback) {
	return Promise.all([chrome.storage.local.get([name, nameDate]), chrome.storage.sync.get([name, nameDate])]).then(result => {
		if (typeof result[0][name] === 'undefined' && typeof result[1][name] === 'undefined') {
			return fallback;
		} else if (typeof result[0][name] === 'undefined' || typeof result[0][nameDate] === 'undefined') {
			chrome.storage.local.set({[name]: result[0][name]});
			chrome.storage.local.set({[nameDate]: result[0][nameDate]});
			return result[1][name];
		} else if (typeof result[1][name] === 'undefined' || typeof result[1][nameDate] === 'undefined') {
			chrome.storage.sync.set({[name]: result[0][name]});
			chrome.storage.sync.set({[nameDate]: result[0][nameDate]});
			return result[0][name];
		} else if (result[0][nameDate] > result[1][nameDate]) {
			chrome.storage.sync.set({[name]: result[0][name]});
			chrome.storage.sync.set({[nameDate]: result[0][nameDate]});
			return result[0][name];
		} else {
			chrome.storage.local.set({[name]: result[0][name]});
			chrome.storage.local.set({[nameDate]: result[0][nameDate]});
			return result[1][name];
		}
		
	});
}

const noteContentLoaded = loadData('note', 'noteDate', 'You can add your notes here!');
noteContentLoaded.then(value => {
	textarea.value = value;
	adjustHeight();
});

const selectionStartLoaded = loadData('selectionStart', 'selectionDate', 0).then(value => textarea.selectionStart = value);
const selectionEndLoaded = loadData('selectionEnd', 'selectionDate', 0).then(value => textarea.selectionEnd = value);

Promise.all([noteContentLoaded, selectionStartLoaded, selectionEndLoaded]).then(result => {
	textarea.blur();
  textarea.focus();
});

Promise.all([noteContentLoaded, chrome.storage.sync.get('darkIcon')]).then(result => {
	darkIcon = typeof result[1]['darkIcon'] !== 'undefined' && result[1]['darkIcon'];
	setIcon(result[0]);
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
								ans = 'use "/" + any command:\n  solve <equation> = simplification and expansion of equation\n  rand <low> <high> = random number between low and high\n  deriv <equation> = derivative of equation with respect to x\n  d2h, h2d, d2b, b2d, b2h, or h2b <number> = base conversion of number\n  Note: trig functions use radians. Multiply by 3.14/180 to use degrees';
						}
						textarea.value = textarea.value.substring(0, i) + textarea.value.substring(i + 1, k + 1) + ' ' + ans + textarea.value.substring(k + 1, textarea.value.length);
						textarea.selectionStart = k + 1;
						textarea.selectionEnd = k + ans.toString().length + 1;
						adjustHeight();
						break check;
					}
				}
			}
		}
	}
	chrome.storage.local.set({['note']: textarea.value});
	chrome.storage.local.set({['noteDate']: Date.now()});
	chrome.storage.local.set({['selectionStart']: textarea.selectionStart});
	chrome.storage.local.set({['selectionEnd']: textarea.selectionEnd});
	chrome.storage.local.set({['selectionDate']: Date.now()});
	lastKey = Date.now();
	saved = 0;
});

textarea.addEventListener('click', function() {
	chrome.storage.local.set({['selectionStart']: textarea.selectionStart});
	chrome.storage.local.set({['selectionEnd']: textarea.selectionEnd});
	chrome.storage.local.set({['selectionDate']: Date.now()});
});

setInterval(function() {
	if (!saved && Date.now() - lastKey > 500) {
		saved = 1;
		chrome.storage.sync.set({['note']: textarea.value});
		chrome.storage.sync.set({['noteDate']: Date.now()});
		chrome.storage.sync.set({['selectionStart']: textarea.selectionStart});
		chrome.storage.sync.set({['selectionEnd']: textarea.selectionEnd});
		chrome.storage.sync.set({['selectionDate']: Date.now()});
	}
}, 500);
