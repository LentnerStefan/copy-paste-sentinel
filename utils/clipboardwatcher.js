const { clipboard } = require("electron");
const _ = require("lodash");
const supportedTypes = require("../supported-types");

var clipboardBadass = (module.exports = {
    index: 0,
    textArray: [],
    increment: function() {
        clipboardBadass.index++;
    },
    reset: function() {
        clipboardBadass.index = 0;
    },
    pushText: function(text) {
        if (!_.includes(clipboardBadass.textArray, text)) {
            if (clipboardBadass.textArray.length >= 4) {
                clipboardBadass.textArray.pop();
                clipboardBadass.textArray.unshift(text);
            } else {
                clipboardBadass.textArray.unshift(text);
            }
            clipboardBadass.index = 0;
        }
    },
    collectAndPushText: function() {
        let text = clipboard.readText();
        clipboardBadass.pushText(text);
    },
    watch: function() {
        let format = findRightFormat();
        switch (format) {
            // We only support plain text right now.
            case supportedTypes.textPlain:
                clipboardBadass.collectAndPushText();
                break;
            case supportedTypes.textHtml:
            case supportedTypes.jpgImg:
            case supportedTypes.pngImg:
            // collectAndPushImage();
            default:
                break;
        }
    },
    getCurrentClipboardText(truncation = false) {
        let text = clipboardBadass.textArray[clipboardBadass.index];
        return text.length <= 100
            ? text
            : truncation
              ? text.slice(0, 100) + "\n##REST_OF_TEXT_IS_TRUNCATED##"
              : text;
    },
    setClipboardTextFromCurrent() {
        clipboard.writeText(clipboardBadass.getCurrentClipboardText());
    }
});

function findRightFormat() {
    let availableFormats = clipboard.availableFormats();
    let isJpg = _.includes(availableFormats, supportedTypes.jpgImg);
    let isPng = _.includes(availableFormats, supportedTypes.pngImg);
    let isHtmlText = _.includes(availableFormats, supportedTypes.textHtml);
    let isPlainText = _.includes(availableFormats, supportedTypes.textPlain);
    if (isJpg) {
        return supportedTypes.jpgImg;
    }
    if (isPng) {
        return supportedTypes.pngImg;
    }
    if (isPlainText) {
        return supportedTypes.textPlain;
    }
    if (isHtmlText) {
        return supportedTypes.textHtml;
    }
}
