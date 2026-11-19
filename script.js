
// ======================================
// SPENDWISE - PERSONAL BUDGET TRACKER
// ======================================

// 1. STORE APPLICATION DATA

let budget = Number(localStorage.getItem("spendwiseBudget")) || 0;

let expenses = JSON.parse(
    localStorage.getItem("spendwiseExpenses")
) || [];


// 2. SELECT HTML ELEMENTS

const budgetInput = document.getElementById("budgetInput");
const budgetBtn = document.getElementById("budgetBtn");

const expenseForm = document.getElementById("expenseForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");

const totalBudget = document.getElementById("totalBudget");
const totalExpenses = document.getElementById("totalExpenses");
const remainingBalance = document.getElementById("remainingBalance");
const spendingPercentage = document.getElementById("spendingPercentage");

const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const budgetMessage = document.getElementById("budgetMessage");

const expenseList = document.getElementById("expenseList");
const emptyMessage = document.getElementById("emptyMessage");
const categoryInsights = document.getElementById("categoryInsights");

const clearBtn = document.getElementById("clearBtn");


// 3. SAVE DATA TO LOCAL STORAGE

function saveData() {
    localStorage.setItem("spendwiseBudget", budget);
    localStorage.setItem("spendwiseExpenses", JSON.stringify(expenses));
}


// 4. CALCULATE TOTAL EXPENSES USING A LOOP

function calculateTotal() {
    let total = 0;

    for (let i = 0; i < expenses.length; i++) {
        total += expenses[i].amount;
    }

    return total;
}


// 5. UPDATE THE DASHBOARD

function updateDashboard() {

    const total = calculateTotal();
    const remaining = budget - total;

    let percentage = 0;

    // CONDITIONAL STATEMENTS

    if (budget > 0) {
        percentage = (total / budget) * 100;
    }

    totalBudget.textContent = "$" + budget.toFixed(2);
    totalExpenses.textContent = "$" + total.toFixed(2);
    remainingBalance.textContent = "$" + remaining.toFixed(2);
    spendingPercentage.textContent = percentage.toFixed(1) + "%";

    // UPDATE PROGRESS BAR

    const progress = Math.min(percentage, 100);

    progressBar.style.width = progress + "%";
    progressLabel.textContent = percentage.toFixed(1) + "%";

    // BUDGET DECISION MAKING

    budgetMessage.className = "";

    if (budget === 0) {
        budgetMessage.textContent = "Please set your monthly budget.";
    }

    else if (remaining < 0) {
        budgetMessage.textContent =
            "Warning! You have exceeded your budget by $" +
            Math.abs(remaining).toFixed(2);

        budgetMessage.classList.add("danger");
        progressBar.style.background = "#dc2626";
    }

    else if (percentage >= 80) {
        budgetMessage.textContent =
            "Warning! You have used more than 80% of your budget.";

        budgetMessage.classList.add("warning");
        progressBar.style.background = "#f59e0b";
    }

    else {
        budgetMessage.textContent =
            "Great job! You are managing your budget well.";

        progressBar.style.background = "#22c55e";
    }

    // SHOW EXPENSES AND INSIGHTS

    displayExpenses();
    displayInsights();

    saveData();
}


// 6. DISPLAY EXPENSE RECORDS USING A LOOP

function displayExpenses() {

    expenseList.innerHTML = "";

    if (expenses.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }

    for (let i = 0; i < expenses.length; i++) {

        const expense = expenses[i];

        const row = document.createElement("tr");

        const values = [
            i + 1,
            expense.description,
            expense.category,
            "$" + expense.amount.toFixed(2),
            expense.date
        ];

        for (let j = 0; j < values.length; j++) {
            const cell = document.createElement("td");
            cell.textContent = values[j];
            row.appendChild(cell);
        }

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.dataset.id = expense.id;

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        expenseList.appendChild(row);
    }
}


// 7. ADD A NEW EXPENSE USING A FORM EVENT

expenseForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;

    // VALIDATION USING CONDITIONALS

    if (description === "" || category === "") {
        alert("Please complete all fields.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount greater than zero.");
        return;
    }

    // CREATE A NEW EXPENSE RECORD

    const newExpense = {
        id: Date.now(),
        description: description,
        amount: amount,
        category: category,
        date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        })
    };

    // ADD RECORD TO ARRAY

    expenses.push(newExpense);

    // UPDATE APPLICATION

    expenseForm.reset();
    updateDashboard();

});


// 8. SET MONTHLY BUDGET

budgetBtn.addEventListener("click", function() {

    const newBudget = Number(budgetInput.value);

    if (!Number.isFinite(newBudget) || newBudget <= 0) {
        alert("Please enter a valid budget greater than zero.");
        return;
    }

    budget = newBudget;

    budgetInput.value = "";

    updateDashboard();

    alert("Your budget has been updated successfully!");
});


// 9. DELETE AN EXPENSE USING EVENT DELEGATION

expenseList.addEventListener("click", function(event) {

    if (event.target.classList.contains("delete-btn")) {

        const expenseId = Number(event.target.dataset.id);

        expenses = expenses.filter(function(expense) {
            return expense.id !== expenseId;
        });

        updateDashboard();
    }

});


// 10. CLEAR ALL EXPENSES

clearBtn.addEventListener("click", function() {

    if (expenses.length === 0) {
        alert("There are no expenses to clear.");
        return;
    }

    const confirmClear = confirm(
        "Are you sure you want to delete all expenses?"
    );

    if (confirmClear) {
        expenses = [];
        updateDashboard();
    }

});


// 11. DISPLAY SPENDING INSIGHTS

function displayInsights() {

    categoryInsights.innerHTML = "";

    const categoryTotals = {};

    // GROUP EXPENSES BY CATEGORY

    for (let i = 0; i < expenses.length; i++) {

        const category = expenses[i].category;

        if (categoryTotals[category] === undefined) {
            categoryTotals[category] = 0;
        }

        categoryTotals[category] += expenses[i].amount;
    }

    const total = calculateTotal();

    // DISPLAY EACH CATEGORY

    for (const category in categoryTotals) {

        const amount = categoryTotals[category];

        let percentage = 0;

        if (total > 0) {
            percentage = (amount / total) * 100;
        }

        const insight = document.createElement("div");
        insight.className = "insight-item";

        const heading = document.createElement("div");
        heading.className = "insight-heading";

        const name = document.createElement("strong");
        name.textContent = category;

        const value = document.createElement("span");
        value.textContent = percentage.toFixed(1) + "%";

        heading.appendChild(name);
        heading.appendChild(value);

        const track = document.createElement("div");
        track.className = "insight-track";

        const fill = document.createElement("div");
        fill.className = "insight-fill";
        fill.style.width = percentage + "%";

        track.appendChild(fill);

        const amountText = document.createElement("small");
        amountText.textContent = "$" + amount.toFixed(2);

        insight.appendChild(heading);
        insight.appendChild(track);
        insight.appendChild(amountText);

        categoryInsights.appendChild(insight);
    }

    if (expenses.length === 0) {
        categoryInsights.textContent =
            "Add expenses to see your spending insights.";
    }
}


// 12. INITIALIZE THE APPLICATION

updateDashboard();

console.log("SpendWise application is ready!");
