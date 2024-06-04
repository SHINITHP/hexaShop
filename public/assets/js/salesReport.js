
function customDateFilter(){
    const startDate = document.getElementById('startDate').value
    const endDate = document.getElementById('endDate').value
    if(startDate && endDate){
        location.href =`/adminLogin/salesReport?filter=customDate&startDate=${startDate}&endDate=${endDate}`
    }
}


function generateExcel(report) {
    const salesReport = JSON.parse(report);
    let index = 1;
    let totalAmount = salesReport.reduce((acc, curr) => acc + curr.Amount, 0);
    const orderCount = salesReport.length;

    const salesDetails = document.querySelectorAll('.salesDetails');
    const table = document.createElement('table'); // Create a table element
    const salesHeading = document.getElementById('salesheading');

    // Create row for total amount
    const totalRow = document.createElement('tr');
    const totalCell = document.createElement('td');
    totalCell.setAttribute('colspan', salesHeading.querySelectorAll('.headingDiv').length);
    totalCell.textContent = `Total Amount: ${totalAmount.toFixed(2)}`;
    totalCell.style.textAlign = 'right';
    totalRow.appendChild(totalCell);

    const totalCellEmpty = document.createElement('td');
    totalRow.appendChild(totalCellEmpty);
    table.appendChild(totalRow);
    totalCell.style.textAlign = 'right'; // Append the total row to the table

    // Create row for order count
    const orderCountRow = document.createElement('tr');
    const orderCountCell = document.createElement('td');
    orderCountCell.setAttribute('colspan', salesHeading.querySelectorAll('.headingDiv').length);
    orderCountCell.textContent = `Order Count: ${orderCount}`;
    orderCountCell.style.textAlign = 'right';
    orderCountRow.appendChild(orderCountCell);

    const orderCountCellEmpty = document.createElement('td');
    orderCountRow.appendChild(orderCountCellEmpty);
    table.appendChild(orderCountRow); // Append the order count row to the table

    // Create table heading row
    const headingRow = document.createElement('tr');
    const headingDivs = salesHeading.querySelectorAll('.headingDiv');
    headingDivs.forEach(headingDiv => {
        const headingCell = document.createElement('th');
        headingCell.textContent = headingDiv.textContent.trim();
        headingRow.appendChild(headingCell); // Append the heading cell to the heading row
    });
    table.appendChild(headingRow); // Append the heading row to the table

    // Iterate over each sales detail div and create corresponding table rows
    salesDetails.forEach(detail => {
        const row = document.createElement('tr'); // Create a table row
        const columns = detail.querySelectorAll('.contentDiv'); // Select all columns inside the current sales detail div

        // Iterate over each column and create corresponding table cells
        columns.forEach(column => {
            const cell = document.createElement('td'); // Create a table cell
            cell.textContent = column.textContent.trim(); // Set the cell content to be the same as the content of the corresponding column
            row.appendChild(cell); // Append the cell to the row
        });

        table.appendChild(row); // Append the row to the table
    });

    const worksheet = XLSX.utils.table_to_sheet(table); // Convert the HTML table to a worksheet

    // Adjust column width
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const colWidth = 20; // Set a default width (you can adjust this as needed)
        worksheet['!cols'] = worksheet['!cols'] || [];
        worksheet['!cols'][C] = { wch: colWidth }; // Set column width
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, 'Sales-Report.xlsx');
}


function generatePDF(report) {

    const salesReport = JSON.parse(report)

    let index = 1;

    let totalAmount = salesReport.reduce((acc, curr, i) => {
        index += i;
        return acc + curr.Amount;
    }, 0);

    console.log('totalAmount', totalAmount)

    // Get the heading element 
    const heading = document.createElement('h1');
    heading.textContent = 'Sales Report';
    heading.textContent = 'Sales Report';
    heading.style.width = '100%';
    heading.style.fontSize = '25pt'
    heading.style.fontWeight = 'bolder'
    heading.style.textAlign = 'center'
    heading.style.paddingTop = '30px'
    heading.style.marginBottom = '30px'

    const total = document.createElement('p')
    total.style.width = '100%';
    total.style.display = 'flex';
    total.style.justifyContent = 'end'
    total.style.paddingRight = '50px'
    total.style.fontSize = '14pt'
    total.style.fontWeight = 'bold'

    const ordercount = document.createElement('p')
    ordercount.style.width = '100%';
    ordercount.style.display = 'flex';
    ordercount.style.justifyContent = 'end'
    ordercount.style.paddingRight = '50px'
    ordercount.style.fontSize = '14pt'
    ordercount.style.fontWeight = 'bold'

    total.innerHTML = `Total Amount : ${totalAmount}`;
    ordercount.innerHTML = `Total Orders : ${index}`;


    // Get the salesheading element
    const salesHeading = document.getElementById('salesheading');

    // Create a container div to hold both heading, salesHeading, and table
    const container = document.createElement('div');
    container.appendChild(heading);
    container.appendChild(total)
    container.appendChild(ordercount)
    if (salesHeading) {
        container.appendChild(salesHeading.cloneNode(true)); // Clone the salesHeading if it exists
    }

    const table = document.querySelectorAll('.salesDetails');

    console.log(table)
    for (let i = 0; i < table.length; i++) {
        container.appendChild(table[i].cloneNode(true)); // Clone the table to avoid modifying the original DOM
    }

    const options = {
        filename: 'SalesReport.pdf',
        jsPDF: { unit: 'in', format: 'a3', orientation: 'portrait' }
    };

    // Convert HTML content (with heading, salesHeading, and table) to PDF
    html2pdf().from(container).set(options).save();

} 