class FirebaseMonitor {
    constructor() {
        this.loadFromStorage();
        this.saveInterval = setInterval(() => this.saveToStorage(), 2000);
    }

    loadFromStorage() {
        const stored = localStorage.getItem('firebaseMonitorData');
        if (stored) {
            const data = JSON.parse(stored);
            this.readCount = data.readCount || 0;
            this.writeCount = data.writeCount || 0;
            this.deleteCount = data.deleteCount || 0;
            this.operations = data.operations || [];
            this.startTime = data.startTime || Date.now();
        } else {
            this.readCount = 0;
            this.writeCount = 0;
            this.deleteCount = 0;
            this.operations = [];
            this.startTime = Date.now();
        }
    }

    saveToStorage() {
        const data = {
            readCount: this.readCount,
            writeCount: this.writeCount,
            deleteCount: this.deleteCount,
            operations: this.operations.slice(-500),
            startTime: this.startTime
        };
        localStorage.setItem('firebaseMonitorData', JSON.stringify(data));
    }

    logRead(path, bytes = 0, page = this.getCurrentPage()) {
        this.readCount++;
        this.operations.push({ type: 'read', page, path, bytes, timestamp: Date.now() });
        this.saveToStorage();
    }

    logWrite(path, bytes = 0, page = this.getCurrentPage()) {
        this.writeCount++;
        this.operations.push({ type: 'write', page, path, bytes, timestamp: Date.now() });
        this.saveToStorage();
    }

    logDelete(path, page = this.getCurrentPage()) {
        this.deleteCount++;
        this.operations.push({ type: 'delete', page, path, timestamp: Date.now() });
        this.saveToStorage();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        return path.split('/').pop() || 'index.html';
    }

    getReport() {
        const uptime = Math.round((Date.now() - this.startTime) / 1000);
        return {
            reads: this.readCount,
            writes: this.writeCount,
            deletes: this.deleteCount,
            total: this.readCount + this.writeCount + this.deleteCount,
            uptime: `${uptime}s`,
            operations: this.operations
        };
    }

    getReportByPage() {
        const byPage = {};
        this.operations.forEach(op => {
            if (!byPage[op.page]) {
                byPage[op.page] = { reads: 0, writes: 0, deletes: 0, total: 0 };
            }
            if (op.type === 'READ') byPage[op.page].reads++;
            if (op.type === 'WRITE') byPage[op.page].writes++;
            if (op.type === 'DELETE') byPage[op.page].deletes++;
            byPage[op.page].total++;
        });
        return byPage;
    }

    showConsoleReport() {
        const report = this.getReport();
        const byPage = this.getReportByPage();

        console.log('%c═══════════════════════════════════════', 'color: #4CAF50; font-weight: bold');
        console.log('%c📊 FIREBASE USAGE REPORT (TODAS LAS PÁGINAS)', 'color: #4CAF50; font-weight: bold; font-size: 14px');
        console.log('%c═══════════════════════════════════════', 'color: #4CAF50; font-weight: bold');
        console.log(`📖 Lecturas (Reads):     ${report.reads}`);
        console.log(`✍️ Escrituras (Writes):   ${report.writes}`);
        console.log(`🗑️ Eliminaciones (Deletes): ${report.deletes}`);
        console.log(`📈 Total Operaciones:    ${report.total}`);
        console.log(`⏱️ Tiempo activo:        ${report.uptime}`);
        console.log('%c═══════════════════════════════════════', 'color: #4CAF50; font-weight: bold');
        console.log('%c📄 OPERACIONES POR PÁGINA:', 'color: #2196F3; font-weight: bold');
        console.table(byPage);
        console.log('%c═══════════════════════════════════════', 'color: #4CAF50; font-weight: bold');
        console.log('%cDETALLE DE OPERACIONES:', 'color: #FF9800; font-weight: bold');
        console.table(this.operations);
    }

    exportToExcel() {
        const report = this.getReport();
        const byPage = this.getReportByPage();

        const data = [
            ['Firebase Usage Report - Todas las Páginas', '', '', '', ''],
            ['Métrica', 'Valor', '', '', ''],
            ['Lecturas', report.reads, '', '', ''],
            ['Escrituras', report.writes, '', '', ''],
            ['Eliminaciones', report.deletes, '', '', ''],
            ['Total', report.total, '', '', ''],
            ['Tiempo activo', report.uptime, '', '', ''],
            ['', '', '', '', ''],
            ['Resumen por Página', '', '', '', ''],
            ['Página', 'Lecturas', 'Escrituras', 'Eliminaciones', 'Total']
        ];

        Object.keys(byPage).forEach(page => {
            const stats = byPage[page];
            data.push([page, stats.reads, stats.writes, stats.deletes, stats.total]);
        });

        data.push(['', '', '', '', '']);
        data.push(['Detalle de Operaciones', '', '', '', '']);
        data.push(['Tipo', 'Página', 'Ruta', 'Timestamp', 'Bytes']);

        this.operations.forEach(op => {
            data.push([op.type, op.page, op.path, op.timestamp, op.bytes || 0]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);

        ws['!cols'] = [
            { wch: 30 },
            { wch: 15 },
            { wch: 50 },
            { wch: 25 },
            { wch: 10 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Firebase Monitor");

        const fecha = new Date().toISOString().split('T')[0];
        const hora = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
        XLSX.writeFile(wb, `Firebase_Monitor_Global_${fecha}_${hora}.xlsx`);

        console.log('📥 Reporte global exportado a Excel');
    }

    reset() {
        this.readCount = 0;
        this.writeCount = 0;
        this.deleteCount = 0;
        this.operations = [];
        this.startTime = Date.now();
        this.saveToStorage();
        console.log('🔄 Monitor reiniciado (todas las páginas)');
    }

    destroy() {
        clearInterval(this.saveInterval);
    }
}

if (!window.fbMonitor) {
    window.fbMonitor = new FirebaseMonitor();
}

console.log('%c🔥 Firebase Monitor Global activado', 'color: #FF6B35; font-weight: bold; font-size: 16px');
console.log(`Página actual: ${window.fbMonitor.getCurrentPage()}`);
console.log('Usa fbMonitor.showConsoleReport() para ver el reporte completo');
console.log('Usa fbMonitor.exportToExcel() para exportar a Excel');
console.log('Usa fbMonitor.reset() para reiniciar contadores');