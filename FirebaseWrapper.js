function wrapFirebaseDatabase(db) {
    if (!db || db._monitorWrapped) return;

    const originalRef = db.ref.bind(db);
    db.ref = function (path) {
        const ref = originalRef(path);

        const originalOnce = ref.once.bind(ref);
        ref.once = function (eventType) {
            window.fbMonitor.logRead(path);
            return originalOnce(eventType);
        };

        const originalOn = ref.on.bind(ref);
        ref.on = function (eventType, callback) {
            window.fbMonitor.logRead(path + ' (listener)');
            return originalOn(eventType, callback);
        };

        const originalSet = ref.set.bind(ref);
        ref.set = function (value) {
            window.fbMonitor.logWrite(path);
            return originalSet(value);
        };

        const originalUpdate = ref.update.bind(ref);
        ref.update = function (value) {
            window.fbMonitor.logWrite(path);
            return originalUpdate(value);
        };

        const originalRemove = ref.remove.bind(ref);
        ref.remove = function () {
            window.fbMonitor.logDelete(path);
            return originalRemove();
        };

        return ref;
    };

    db._monitorWrapped = true;
}

if (typeof db !== 'undefined') {
    wrapFirebaseDatabase(db);
}