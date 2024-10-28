const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow, oneWindow, twoWindow, threeWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 200,
    x: 0,
    y: 650,
    webPreferences: {
      nodeIntegration: false, // Set to false for security
      contextIsolation: true, // Recommended for security
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  oneWindow = new BrowserWindow({
    width: 400,
    height: 600,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false, 
      contextIsolation: true,
    },
  });

  twoWindow = new BrowserWindow({
    width: 400,
    height: 600,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false, 
      contextIsolation: true,
    },
  });

  threeWindow = new BrowserWindow({
    width: 400,
    height: 600,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false, 
      contextIsolation: true,
    },
  });

  threeWindow.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36');

  oneWindow.setPosition(200, 0);
  twoWindow.setPosition(600, 0);
  threeWindow.setPosition(1000, 0);

  oneWindow.loadURL('https://www.meta.ai').then(() => {
    console.log("oneWindow URL loaded");
    // Now set up the listener for the 'did-finish-load' event
    oneWindow.webContents.on('did-finish-load', () => {
      console.log("Current URL in oneWindow:", oneWindow.webContents.getURL());
    });
  }).catch((error) => {
    console.error('Error loading URL:', error);
  });
  
  twoWindow.loadURL('https://chatgpt.com').catch(console.error);
  threeWindow.loadURL('https://copilot.microsoft.com').catch(console.error);
  mainWindow.loadFile('index.html').catch(console.error);

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.executeJavaScript(`
      const inputBox = document.getElementById('input-box');
      if (inputBox) {
        inputBox.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            const inputValue = e.target.value;
            console.log('Sending search term:', inputValue);
            window.api.send('search-term', inputValue);
          }
        });
      }
    `).catch(console.error);
  });

  [mainWindow, oneWindow, twoWindow, threeWindow].forEach(win => win && win.show());
}

ipcMain.on('search-term', (event, searchTerm) => {
  console.log('Received search term:', searchTerm);

  oneWindow.webContents.on('did-finish-load', () => {
    console.log("Current URL in oneWindow:", oneWindow.webContents.getURL());

    const script = `
      (function() {
        console.log("Attempting to locate textarea with id ':rd:'");

        function updateTextarea() {
          const textarea = document.getElementById(':rd:');
          console.log('Textarea element found:', textarea ? true : false);
          if (textarea) {
            console.log('Setting textarea value...');
            textarea.value = \`${searchTerm}\`;
            textarea.dispatchEvent(new Event('input'));
            console.log('Textarea value set to:', textarea.value);
          } else {
            console.log('Textarea with id ":rd:" not found in DOM');
          }
        }

        // Use MutationObserver to detect element if it's added dynamically
        const observer = new MutationObserver((mutationsList, observer) => {
          const textarea = document.getElementById(':rd:');
          if (textarea) {
            console.log('Textarea dynamically added to DOM.');
            updateTextarea();
            observer.disconnect(); // Stop observing once the element is found
          }
        });

        // Start observing the body for changes
        observer.observe(document.body, { childList: true, subtree: true });

        // Try updating immediately in case the element is already present
        updateTextarea();
      })();
    `;

    oneWindow.webContents.executeJavaScript(script).catch(error => {
      console.error('Error executing JavaScript:', error);
    });
  });
});


app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
