document.addEventListener('DOMContentLoaded', () => {
    const customerTable = document.getElementById('tableBody');
    const filterName = document.getElementById('filterName');
    const filterAmount = document.getElementById('filterAmount');
    const chartsContainer = document.getElementById('chartsContainer');

    let customers = [];
    let transactions = [];
    
    // Fetch data from the server
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            customers = data.customers;
            transactions = data.transactions;
            displayData();
        });

    // Display data in the table
    function displayData() {
        customerTable.innerHTML = '';
        const nameFilter = filterName.value.toLowerCase();
        const amountFilter = parseFloat(filterAmount.value);

        transactions.forEach(transaction => {
            const customer = customers.find(c => c.id === transaction.customer_id);
            if ((nameFilter && !customer.name.toLowerCase().includes(nameFilter)) ||
                (amountFilter && transaction.amount < amountFilter)) {
                return;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${transaction.date}</td>
                <td>${transaction.amount}</td>
                <td><button onclick="viewChart(${customer.id})">View</button></td>
            `;
            customerTable.appendChild(row);
        });
    }

    filterName.addEventListener('input', displayData);
    filterAmount.addEventListener('input', displayData);

    window.viewChart = function(customerId) {
        const customerTransactions = transactions.filter(t => t.customer_id === customerId);
        const dates = customerTransactions.map(t => t.date);
        const amounts = customerTransactions.map(t => t.amount);

        // Clear the charts container
        chartsContainer.innerHTML = '';

        // Create a new canvas for the chart
        const canvas = document.createElement('canvas');
        canvas.id = `chart-${customerId}`;
        chartsContainer.appendChild(canvas);

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Transaction Amount',
                    data: amounts,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'start',
                        labels: {
                            boxWidth: 10,
                            boxHeight: 10,
                            padding: 20
                        }
                    }
                }
            }
        });
    }
});
