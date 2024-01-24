$("#excel-file").change(function(event) {
    try {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            try {
                var data = event.target.result;
                var workbook = XLSX.read(data, {type: 'binary'});
                var sheet_name_list = workbook.SheetNames;
                var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
                createTable(xlData);
            } catch (error) {
                console.error('Error al procesar el archivo Excel:', error);
            }
        };
        reader.readAsBinaryString(file);
    } catch (error) {
        console.error('Error al leer el archivo:', error);
    }
});
$("#excel-file").change(function(event) {
    var file = event.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        // Resto del código...
    } else {
        console.error('Por favor, seleccione un archivo Excel válido.');
    }
});
