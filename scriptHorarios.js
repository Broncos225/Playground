const table = document.getElementById('editableTable');

table.addEventListener('input', function(event) {
    const cell = event.target;
    if (cell.tagName.toLowerCase() === 'td' || cell.tagName.toLowerCase() === 'th') {
        cell.setAttribute('data-content', cell.textContent);
    }
});

function restoreChanges() {
    const cells = table.querySelectorAll('td[data-content], th[data-content]');
    cells.forEach(cell => {
        cell.textContent = cell.getAttribute('data-content');
    });
}