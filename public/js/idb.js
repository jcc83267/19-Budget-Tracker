let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('update_budget', { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        function uploadBudget() {
            const transaction = db.transaction(['update_budget'], 'readwrite');
            const budgetObjectStore = transaction.objectStore('update_budget');

            const getAll = budgetObjectStore.getAll();

            getAll.onsuccess = function () {
                if (getAll.result.length > 0) {
                    fetch('/api/transaction', {
                        method: 'POST',
                        body: JSON.stringify(getAll.result),
                        headers: {
                            Accept: 'application/json, text/plain, */*',
                            'Content-Type': 'application/json'
                        }
                    })
                        .then(response => response.json())
                        .then(serverResponse => {
                            if (serverResponse.message) {
                                throw new Error(serverResponse);
                            }
                            const transaction = db.transaction(['update_budget'], 'readwrite');
                            const budgetObjectStore = transaction.objectStore('update_budget');
                            budgetObjectStore.clear();

                            alert('All saved transactions has been submitted and updated!');
                        })
                        .catch(err => {
                            console.log(err);
                        });
                }
            };
        }
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['update_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('update_budget');

    budgetObjectStore.add(record);
}

window.addEventListener('online', uploadBudget);