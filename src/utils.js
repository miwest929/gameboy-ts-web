import Raven from "raven-js";

export const handleError = (error, errorInfo) => {
  console.error(error);
  Raven.captureException(error, { extra: errorInfo });
};

export function loadBinary(path, callback, handleProgress) {
  var req = new XMLHttpRequest();
  req.open("GET", path);
  req.overrideMimeType("text/plain; charset=x-user-defined");
  req.onload = function() {
    if (this.status === 200) {
      if (req.responseText.match(/^<!doctype html>/i)) {
        // Got HTML back, so it is probably falling back to index.html due to 404
        return callback(new Error("Page not found"));
      }

      //const decoded = atob(this.responseText);
      const buffer = new Uint8Array(new ArrayBuffer(this.responseText.length));
      for (let i = 0; i < this.responseText.length; i++) {
          buffer[i] = this.responseText.charCodeAt(i) & 0xff;
      }

      callback(null, buffer);
    } else if (this.status === 0) {
      // Aborted, so ignore error
    } else {
      callback(new Error(req.statusText));
    }
  };
  req.onerror = function() {
    callback(new Error(req.statusText));
  };
  req.onprogress = handleProgress;
  req.send();
  return req;
}