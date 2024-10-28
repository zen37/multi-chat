const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;
let oneWindow;
let twoWindow;
let threeWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 200,
    x: 0,
    y: 650,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  oneWindow = new BrowserWindow({
    width: 400,
    height: 600,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  twoWindow = new BrowserWindow({
    width: 400,
    height: 600,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  threeWindow = new BrowserWindow({
    width: 400,
    height: 600,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  threeWindow.webContents.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36';

  oneWindow.setPosition(200, 0);
  twoWindow.setPosition(600, 0);
  threeWindow.setPosition(1000, 0);

  oneWindow.loadURL('https://www.meta.ai');
  twoWindow.loadURL('https://chatgpt.com');
  threeWindow.loadURL('https://copilot.microsoft.com');

  mainWindow.loadFile('index.html');

  oneWindow.show();
  twoWindow.show();
  threeWindow.show();
  mainWindow.show();

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.executeJavaScript(`
      document.getElementById('input-box').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const inputValue = e.target.value;
          window.api.send('search-term', inputValue);
        }
      });
    `);
  });
}

ipcMain.on('search-term', (event, searchTerm) => {
  oneWindow.webContents.executeJavaScript(`
    document.querySelector('input[type="search"]').value = '${searchTerm}';
    document.querySelector('input[type="search"]').dispatchEvent(new Event('input'));
  `);
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});