const electron = require("electron");
const clipboardWatcher = require("./clipboardwatcher");
// Module to control application life.
const { app, Tray, Menu, globalShortcut, nativeImage } = electron;
// Module to control the clipboard
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");

let appTray;

function createWindow(mainWindow) {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false //,
        //frame: false
    });
    // On charge le hmtl dans cette windows
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true
        })
    );
    // On retire le menu de l'app
    mainWindow.setMenu(null);

    createTray(mainWindow);

    // Emitted when the window is closed.
    mainWindow.on("closed", function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.on("minimize", function(event) {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.on("close", function(event) {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
    globalShortcut.register("CommandOrControl+B", () => {
        displayCurrentClipboardContent();
    });
    globalShortcut.register("CommandOrControl+Shift+B", () => {
        moveArrayIndexAndShowContent();
    });
    setInterval(clipboardWatcher.watch, 250);
}

function createTray(mainWindow) {
    // On crée le tray (barre d'icones en bas à droite)
    appTray = null;
    appTray = new Tray("./ressources/icon.png");
    let contextMenu = Menu.buildFromTemplate([
        {
            label: "Quit",
            click: function() {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);
    appTray.setContextMenu(contextMenu);
    appTray.on("click", function handleClicked() {
        displayCurrentClipboardContent();
    });
}

function displayCurrentClipboardContent() {
    clipboardWatcher.textArray.length > 0
        ? displayBalloonWithClipboardContent()
        : displayBalloonNoClipboardContent();
}

function moveArrayIndexAndShowContent(appTray) {
    if (clipboardWatcher.index === clipboardWatcher.textArray.length - 1) {
        clipboardWatcher.reset();
    } else if (
        clipboardWatcher.index + 1 <=
        clipboardWatcher.textArray.length - 1
    ) {
        clipboardWatcher.increment();
    }
    clipboardWatcher.setClipboardTextFromCurrent();
    displayCurrentClipboardContent(appTray);
}

function displayBalloonWithClipboardContent() {
    appTray.displayBalloon({
        title: "",
        content:
            "CP# " +
            (clipboardWatcher.index + 1) +
            ":\n\n" +
            clipboardWatcher.getCurrentClipboardText(true)
    });
}
function displayBalloonNoClipboardContent() {
    appTray.displayBalloon({
        title: "",
        content: "Clipboard is empty !"
    });
}

module.exports = createWindow;
