document.addEventListener("click", function (e) {
    if (e.target.id === "toggleMonitor" || e.target.closest("#toggleMonitor")) {
        const panel = document.getElementById("monitorPanel");
        panel.style.display = panel.style.display === "none" ? "block" : "none";
        if (panel.style.display === "block") {
            updateMonitorUI();
        }
    }
});

function updateMonitorUI() {
    if (window.fbMonitor) {
        const report = window.fbMonitor.getReport();
        document.getElementById("monitorReads").textContent = report.reads;
        document.getElementById("monitorWrites").textContent = report.writes;
        document.getElementById("monitorDeletes").textContent = report.deletes;
        document.getElementById("monitorTotal").textContent = report.total;
    }
}

setInterval(updateMonitorUI, 1000);
