document.getElementById('yearlyFilter').addEventListener('click', function () {
        document.getElementById('monthlyFilter').style.backgroundColor = '#eee'
        document.getElementById('yearlyFilter').style.backgroundColor = '#a5a5a5'
})

document.getElementById('monthlyFilter').addEventListener('click', function () {
        document.getElementById('yearlyFilter').style.backgroundColor = '#eee'
        document.getElementById('monthlyFilter').style.backgroundColor = '#a5a5a5'
})

function isValidJSON(str) {
        try {
                JSON.parse(str);
                return true;
        } catch (error) {
                return false;
        }
}


document.addEventListener('DOMContentLoaded', function () {
        let mensOrder = 0, womensOrder = 0, kidsOrder = 0;
        fetch('/adminLogin/adminDashboard/sales')
                .then(response => {
                        if (!response.ok) {
                                throw new Error('Network response was not ok ' + response.statusText);
                        }
                        return response.json();
                })
                .then(salesDetails => {
                        // console.log(salesDetails);

                        salesDetails.forEach((val) => {
                                val.productID.CategoryName === 'Mens' ? mensOrder++ : mensOrder = mensOrder
                                val.productID.CategoryName === 'Womens' ? womensOrder++ : womensOrder = womensOrder
                                val.productID.CategoryName === 'Kids' ? kidsOrder++ : kidsOrder = kidsOrder
                                // console.log('val.productID :', val.productID)
                        })
                        // console.log(mensOrder,womensOrder,kidsOrder)
                        // Now you can use the salesDetails data as needed
                        var oilCanvas = document.getElementById("oilChart");
                        Chart.defaults.global.defaultFontFamily = "Lato";
                        Chart.defaults.global.defaultFontSize = 12;
                        var oilData = {
                                labels: [
                                        "Kid",
                                        "Women",
                                        "Men"
                                ],
                                datasets: [{
                                        data: [kidsOrder, womensOrder, mensOrder],
                                        backgroundColor: [
                                                "#FF6384",
                                                "#63FF84",
                                                "#04A4E5"
                                        ]
                                }]
                        };
                        var pieChart = new Chart(oilCanvas, {
                                type: 'pie',
                                data: oilData
                        });

                        salesGraph('monthly', salesDetails)
                })
                .catch(error => {
                        console.error('There has been a problem with your fetch operation:', error);
                });


});

let revChart;



function customDateFilter(salesDetails) {
        let salesReport;
        if (isValidJSON(salesDetails)) {
                salesReport = JSON.parse(salesDetails)
        } else {
                salesReport = salesDetails;
        }
        const startDate = document.getElementById('startDate').value
        const endDate = document.getElementById('endDate').value
        let dateCounts = {};

        if (startDate && endDate) {
                salesReport.forEach((value, i) => {
                        let orderDate = new Date(value.OrderDate);
                        let startDateObj = new Date(startDate);
                        let endDateObj = new Date(endDate);
                
                        if (orderDate >= startDateObj && orderDate <= endDateObj) {
                                if (!dateCounts[orderDate.toLocaleDateString()]) {
                                        dateCounts[orderDate.toLocaleDateString()] = 0; // Initialize the value to zero
                                }
                                if (dateCounts.hasOwnProperty(orderDate.toLocaleDateString())) {
                                        dateCounts[orderDate.toLocaleDateString()]++;
                                }
                        }
                });
                let labels = Object.keys(dateCounts);
                let data = Object.values(dateCounts);
                if (revChart) {
                        revChart.destroy();
                }

                Chart.defaults.global.defaultFontFamily = "Poppins";
                let ctx = document.querySelector("#revenueChart");
                ctx.height = 53;

                revChart = new Chart(ctx, {
                        type: "bar",
                        data: {
                                labels: labels,
                                datasets: [
                                        {
                                                label: "Actual Sales",
                                                borderColor: "green",
                                                backgroundColor: "#1C4E80",
                                                data: data
                                        },

                                ]
                        },
                        options: {
                                responsive: true,
                                tooltips: {
                                        intersect: false,
                                        node: "index"
                                },
                                scales: {
                                        xAxes: [{
                                                barPercentage: 1.2,  // Reduce bar width to 50% of the default width
                                                categoryPercentage: 0.5  // Reduce the category width to 50% of the default width
                                        }],
                                        yAxes: [{
                                                ticks: {
                                                        min: 0,  // Set minimum value for y-axis
                                                        callback: function (value) {  // Format tick values
                                                                if (Number.isInteger(value)) {
                                                                        return value;  // Only display integer values
                                                                }
                                                        }
                                                }
                                        }]
                                }
                        }
                });
        }



}



function salesGraph(val, salesDetails) {
        let salesReport;
        if (isValidJSON(salesDetails)) {
                salesReport = JSON.parse(salesDetails)
        } else {
                salesReport = salesDetails;
        }

        let monthly = {
                jan: 0, feb: 0, mar: 0, apr: 0, may: 0, june: 0,
                july: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
        };

        let yearly = {};  // Object to store the number of products bought each year

        salesReport.forEach((val) => {
                const orderDate = new Date(val.OrderDate);
                const month = orderDate.getMonth();
                const year = orderDate.getFullYear();

                monthly[Object.keys(monthly)[month]]++;

                if (!yearly[year]) {
                        yearly[year] = 0;
                }

                // Increment the count for the corresponding year
                yearly[year]++;
        });
        let allYears = Object.keys(yearly).map(year => parseInt(year, 10)).sort((a, b) => a - b);
        let startYear = allYears[0] - 4;
        let endYear = allYears[allYears.length - 1] + 4;
        let labels = [];
        let data = [];

        // Populate labels and data ensuring each year in the range is included
        for (let year = startYear; year <= endYear; year++) {
                labels.push(year);
                data.push(yearly[year] || 0);  // Use 0 if the year is not in the yearly object
        }

        console.log('monthly :', monthly)
        if (val === 'monthly') {
                // Check if revChart exists, if yes, destroy it
                if (revChart) {
                        revChart.destroy();
                }

                Chart.defaults.global.defaultFontFamily = "Poppins";
                let ctx = document.querySelector("#revenueChart");
                ctx.height = 53;

                revChart = new Chart(ctx, {
                        type: "bar",
                        data: {
                                labels: [
                                        "Jan",
                                        "Feb",
                                        "Mar",
                                        "Apr",
                                        "May",
                                        "June",
                                        "July",
                                        "Aug",
                                        "Sep",
                                        "Oct",
                                        "Nov",
                                        "Dec"
                                ],
                                datasets: [
                                        {
                                                label: "Actual Sales",
                                                borderColor: "green",
                                                backgroundColor: "#1C4E80",
                                                data: [monthly.jan, monthly.feb, monthly.mar, monthly.apr, monthly.may, monthly.june, monthly.july, monthly.aug, monthly.sep, monthly.oct, monthly.nov, monthly.dec]
                                        },

                                ]
                        },
                        options: {
                                responsive: true,
                                tooltips: {
                                        intersect: false,
                                        node: "index"
                                },
                                scales: {
                                        xAxes: [{
                                                barPercentage: 1.2,  // Reduce bar width to 50% of the default width
                                                categoryPercentage: 0.5  // Reduce the category width to 50% of the default width
                                        }],
                                        yAxes: [{
                                                ticks: {
                                                        min: 0,  // Set minimum value for y-axis
                                                        callback: function (value) {  // Format tick values
                                                                return value;
                                                        }
                                                }
                                        }]
                                }
                        }
                });
        } else {
                // Check if revChart exists, if yes, destroy it
                if (revChart) {
                        revChart.destroy();
                }
                Chart.defaults.global.defaultFontFamily = "Poppins";
                let ctx = document.querySelector("#revenueChart");
                ctx.height = 53;

                revChart = new Chart(ctx, {
                        type: "bar",
                        data: {
                                labels: labels,
                                datasets: [
                                        {
                                                label: "Actual Sales",
                                                borderColor: "green",
                                                backgroundColor: "#1C4E80",
                                                data: data
                                        },

                                ]
                        },
                        options: {
                                responsive: true,
                                tooltips: {
                                        intersect: false,
                                        node: "index"
                                },
                                scales: {
                                        xAxes: [{
                                                barPercentage: 1.2,  // Reduce bar width to 50% of the default width
                                                categoryPercentage: 0.5  // Reduce the category width to 50% of the default width
                                        }],
                                        yAxes: [{
                                                ticks: {
                                                        min: 0,  // Set minimum value for y-axis
                                                        callback: function (value) {  // Format tick values
                                                                if (Number.isInteger(value)) {
                                                                        return value;  // Only display integer values
                                                                }
                                                        }
                                                }
                                        }]
                                }
                        }
                });
        }


}






