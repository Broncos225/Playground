        // Create table data
        const tableData = [
            { tipo: "Incidente", aplicacion: "Aplicaciones de negocio", CatM: "CEGID", CatH: "Error dispositivo fiscal", Esc1: "Mesa de ayuda", Esc2: "Daniel Morales - Coordinador aplicaciones" },
        ];

        // Function to create table rows and cells
        function createTableRows(data) {
            const table = document.getElementById('myTable');
            data.forEach((item) => {
                const row = document.createElement('tr');

                const Tipo = document.createElement('td');
                idCell.textContent = item.tipo;
                row.appendChild(Tipo);

                const Aplicacion = document.createElement('td');
                nameCell.textContent = item.aplicacion;
                row.appendChild(Aplicacion);

                const CategoriaM = document.createElement('td');
                ageCell.textContent = item.CatM;
                row.appendChild(CategoriaM);

                const CategoriaH = document.createElement('td');
                cityCell.textContent = item.CatH;
                row.appendChild(CategoriaH);

                const Escala1 = document.createElement('td');
                cityCell.textContent = item.Esc1;
                row.appendChild(Escala1);

                const Escala2 = document.createElement('td');
                cityCell.textContent = item.Esc2;
                row.appendChild(Escala2);

                table.appendChild(row);
            });
        }

        // Call the function with table data
        createTableRows(tableData);

        // Function to filter table rows based on the selected values
        function filterTable() {
            const filterId = document.getElementById('filterId').value;
            const filterName = document.getElementById('filterName').value;

            const tableRows = document.querySelectorAll('#myTable tr');

            tableRows.forEach((row) => {
                const idCell = row.children[0];
                const nameCell = row.children[1];

                if (
                    (filterId === '' || idCell.textContent.trim() === filterId) &&
                    (filterName === '' || nameCell.textContent.trim() === filterName)
                ) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        // Add event listeners to filter dropdowns
        document.getElementById('filterId').addEventListener('change', filterTable);
        document.getElementById('filterName').addEventListener('change', filterTable);