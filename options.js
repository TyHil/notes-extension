const realBrowser = typeof browser !== 'undefined' ? browser : chrome;

/* Run On Open */

const darkMode = document.getElementById('darkMode');
realBrowser.storage.sync.get('darkMode', function (result) {
  if (typeof result['darkMode'] !== 'undefined') {
    if (result['darkMode']) {
      darkMode.checked = true;
      document.body.classList.add('dark');
    } else {
      darkMode.checked = false;
    }
  }
});
darkMode.addEventListener('click', function () {
  if (darkMode.checked) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  realBrowser.storage.sync.set({ darkMode: darkMode.checked ? 1 : 0 });
});

const darkIcon = document.getElementById('darkIcon');
realBrowser.storage.sync.get('darkIcon', function (result) {
  if (typeof result['darkIcon'] !== 'undefined') {
    if (result['darkIcon']) {
      darkIcon.checked = true;
      document.body.classList.add('dark');
    } else {
      darkIcon.checked = false;
    }
  }
});
function loadData(name, nameDate, fallback) {
  return Promise.all([
    realBrowser.storage.local.get([name, nameDate]),
    realBrowser.storage.sync.get([name, nameDate])
  ]).then(result => {
    if (typeof result[0][name] === 'undefined' && typeof result[1][name] === 'undefined') {
      return fallback;
    } else if (
      typeof result[0][name] === 'undefined' ||
      typeof result[0][nameDate] === 'undefined'
    ) {
      return result[1][name];
    } else if (
      typeof result[1][name] === 'undefined' ||
      typeof result[1][nameDate] === 'undefined'
    ) {
      return result[0][name];
    } else if (result[0][nameDate] > result[1][nameDate]) {
      return result[0][name];
    } else {
      return result[1][name];
    }
  });
}
darkIcon.addEventListener('click', function () {
  realBrowser.storage.sync.set({ darkIcon: darkIcon.checked ? 1 : 0 });
  loadData('note', 'noteDate', 'You can add your notes here!').then(value => {
    realBrowser.action.setIcon({
      path:
        'images/bulb' +
        (value === '' ? 'Off' : 'On') +
        (darkIcon.checked ? 'Dark' : 'Light') +
        '.png'
    });
  });
});
