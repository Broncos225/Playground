// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyATTHnCqWpXNmD9HAAOPvfGorM5tfRkeC8",
    authDomain: "horariosstop.firebaseapp.com",
    databaseURL: "https://horariosstop-default-rtdb.firebaseio.com",
    projectId: "horariosstop",
    storageBucket: "horariosstop.appspot.com",
    messagingSenderId: "641396796563",
    appId: "1:641396796563:web:c5438e2ffac5090974b166"
};


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Save function
function saveChanges() {
    var table = document.getElementById('editableTable');
    var schedule = {};

    // Loop through each row in the table
    for (var i = 1, row; row = table.rows[i]; i++) {
        // The first cell in the row is the name
        var name = row.cells[0].innerText;

        // The rest of the cells are the schedule
        var days = [];
        for (var j = 1, cell; cell = row.cells[j]; j++) {
            days.push(cell.innerText);
        }

        // Add the schedule to the object
        schedule[name] = days;
    }

    // Save the schedule to Firebase
    set(ref(database, 'schedules/'), schedule)
        .then(() => {
            console.log('Data saved successfully');
        })
        .catch((error) => {
            console.error('Error saving data: ', error);
        });
}

// Restore function
function restoreChanges() {
    const dbRef = ref(database, 'schedules/');

    onValue(dbRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
            const table = document.getElementById('editableTable');

            // Remove existing rows (except the header)
            for (let i = table.rows.length - 1; i > 0; i--) {
                table.deleteRow(i);
            }

            // Iterate through the saved data and recreate the table
            for (const name in data) {
                const row = table.insertRow(-1);
                const nameCell = row.insertCell(0);
                nameCell.contentEditable = 'false';
                nameCell.innerText = name;

                for (const day in data[name]) {
                    const cell = row.insertCell(-1);
                    cell.setAttribute('data-day', day);
                    cell.contentEditable = 'true';
                    cell.innerText = data[name][day];
                }
            }
        }
    }, {
        onlyOnce: true,
    });
}
