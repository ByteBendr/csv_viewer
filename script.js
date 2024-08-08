document.getElementById('file-input').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const contents = e.target.result;
        if (file.name.endsWith('.csv')) {
            parseCSV(contents);
        } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
            parseExcel(contents);
        } else {
            alert('Unsupported file format');
        }
    };

    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsBinaryString(file);
    }
}

function parseCSV(data) {
    Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            displayTable(results.data);
        },
        error: function (error) {
            console.error('Error parsing CSV:', error);
        }
    });
}

function parseExcel(data) {
    const workbook = XLSX.read(data, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = json[0];
    const rows = json.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = row[i];
        });
        return obj;
    });
    displayTable(rows);
}

function displayTable(data) {
    const table = document.getElementById('csv-table');
    table.innerHTML = ''; // Clear previous contents

    if (data.length === 0) {
        return;
    }

    const header = Object.keys(data[0]);
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    header.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        header.forEach(col => {
            const td = document.createElement('td');
            const cellValue = row[col];
            
            // Check if cell value is a URL
            if (isValidURL(cellValue)) {
                const a = document.createElement('a');
                a.href = cellValue;
                a.textContent = cellValue;
                a.target = '_blank'; // Open link in a new tab
                a.rel = 'noopener noreferrer'; // For security
                td.appendChild(a);
            } else {
                td.textContent = cellValue;
            }
            
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
