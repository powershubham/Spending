// Expense Management Module

// DOM Elements
const expenseForm = document.getElementById('expenseForm');
const expensesTableBody = document.getElementById('expensesTableBody');
const categoryFilter = document.getElementById('categoryFilter');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const editModal = document.getElementById('editModal');
const editExpenseForm = document.getElementById('editExpenseForm');
const closeModalBtn = document.getElementById('closeModal');
const cancelEditBtn = document.getElementById('cancelEdit');

// State
let currentPage = 0;
const pageSize = 10;
let currentFilter = '';

// Set today's date as default for expense date
const expenseDateInput = document.getElementById('expenseDate');
if (expenseDateInput) {
    expenseDateInput.valueAsDate = new Date();
}

// Add Expense Form Handler
if (expenseForm) {
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('expenseTitle').value;
        const category = document.getElementById('expenseCategory').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const date = document.getElementById('expenseDate').value;

        try {
            const response = await fetch(`${window.API_BASE_URL}/expenses`, {
                method: 'POST',
                headers: window.getAuthHeaders(),
                body: JSON.stringify({ title, category, amount, date })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = 'index.html';
                    return;
                }
                const errorData = await response.json().catch(() => ({ message: 'Failed to add expense' }));
                throw new Error(errorData.message || 'Failed to add expense');
            }

            window.showMessage('Expense added successfully!', 'success');
            expenseForm.reset();
            expenseDateInput.valueAsDate = new Date();

            // Refresh expenses list if on expenses section
            const expensesSection = document.getElementById('expensesSection');
            if (expensesSection && expensesSection.classList.contains('active')) {
                loadExpenses();
            }

            // Refresh dashboard if on dashboard section
            const dashboardSection = document.getElementById('dashboardSection');
            if (dashboardSection && dashboardSection.classList.contains('active')) {
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
            }

        } catch (error) {
            window.showMessage(error.message || 'Failed to add expense', 'error');
        }
    });
}

// Load Expenses
async function loadExpenses(page = 0, category = '') {
    currentPage = page;
    currentFilter = category;

    let url;
    
    // Use category filter API if category is selected
    if (category) {
        url = `${window.API_BASE_URL}/expenses/category/${category}`;
    } else {
        url = `${window.API_BASE_URL}/expenses`;
    }

    try {
        const response = await fetch(url, {
            headers: window.getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'index.html';
                return;
            }
            throw new Error('Failed to load expenses');
        }

        const data = await response.json();
        
        // Handle both paginated and non-paginated responses
        let expenses = [];
        if (Array.isArray(data)) {
            // Non-paginated response - data is directly an array
            expenses = data;
            renderExpensesTable(expenses);
            // Hide pagination for non-paginated response
            pageInfo.textContent = '';
            prevPageBtn.style.display = 'none';
            nextPageBtn.style.display = 'none';
        } else if (data.content && Array.isArray(data.content)) {
            // Paginated response
            expenses = data.content;
            renderExpensesTable(expenses);
            updatePagination(data);
        } else {
            // Unknown format
            renderExpensesTable([]);
        }

    } catch (error) {
        console.error('Error loading expenses:', error);
        window.showMessage('Failed to load expenses', 'error');
    }
}

// Render Expenses Table
function renderExpensesTable(expenses) {
    if (expenses.length === 0) {
        expensesTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <div class="empty-state-icon">📭</div>
                        <h3>No expenses found</h3>
                        <p>Start adding your expenses or adjust your filter</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    expensesTableBody.innerHTML = expenses.map(expense => `
        <tr data-id="${expense.id}">
            <td data-label="Title">${expense.title}</td>
            <td data-label="Category"><span class="category-badge">${getCategoryDisplay(expense.category)}</span></td>
            <td data-label="Amount">${window.formatCurrency(expense.amount)}</td>
            <td data-label="Date">${window.formatDate(expense.date)}</td>
            <td class="actions">
                <button class="btn btn-sm btn-outline edit-btn" data-id="${expense.id}">Edit</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${expense.id}">Delete</button>
            </td>
        </tr>
    `).join('');

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteExpense(btn.dataset.id));
    });
}

// Update Pagination
function updatePagination(data) {
    const totalPages = data.totalPages || 0;
    const currentPage = data.number || 0;

    pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages || 1}`;
    prevPageBtn.disabled = currentPage === 0;
    nextPageBtn.disabled = currentPage >= totalPages - 1;
}

// Pagination Event Listeners
if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            loadExpenses(currentPage - 1, currentFilter);
        }
    });
}

if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
        loadExpenses(currentPage + 1, currentFilter);
    });
}

// Category Filter
if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
        loadExpenses(0, e.target.value);
    });
}

// Open Edit Modal
async function openEditModal(expenseId) {
    console.log('Opening edit modal for expense ID:', expenseId);
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/expenses/${expenseId}`, {
            headers: window.getAuthHeaders()
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to load expense details:', errorText);
            throw new Error('Failed to load expense details: ' + errorText);
        }

        const expense = await response.json();
        console.log('Expense data loaded:', expense);

        // Populate form with expense data
        document.getElementById('editExpenseId').value = expense.id || '';
        document.getElementById('editExpenseTitle').value = expense.title || '';
        document.getElementById('editExpenseCategory').value = expense.category || '';
        document.getElementById('editExpenseAmount').value = expense.amount || 0;
        document.getElementById('editExpenseDate').value = expense.date || '';

        // Show modal
        editModal.classList.add('active');

    } catch (error) {
        console.error('Error loading expense:', error);
        window.showMessage(error.message || 'Failed to load expense details', 'error');
    }
}

// Close Edit Modal
function closeEditModal() {
    editModal.classList.remove('active');
    editExpenseForm.reset();
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeEditModal);
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', closeEditModal);
}

// Close modal when clicking outside
if (editModal) {
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

// Update Expense
if (editExpenseForm) {
    editExpenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('editExpenseId').value;
        const title = document.getElementById('editExpenseTitle').value;
        const category = document.getElementById('editExpenseCategory').value;
        const amount = parseFloat(document.getElementById('editExpenseAmount').value);
        const date = document.getElementById('editExpenseDate').value;

        console.log('Updating expense:', { id, title, category, amount, date });

        try {
            const response = await fetch(`${window.API_BASE_URL}/expenses/${id}`, {
                method: 'PUT',
                headers: window.getAuthHeaders(),
                body: JSON.stringify({ title, category, amount, date })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = 'index.html';
                    return;
                }
                const errorText = await response.text();
                console.error('Update failed:', errorText);
                throw new Error('Failed to update expense: ' + errorText);
            }

            window.showMessage('Expense updated successfully!', 'success');
            closeEditModal();
            loadExpenses(currentPage, currentFilter);

            // Refresh dashboard if on dashboard section
            const dashboardSection = document.getElementById('dashboardSection');
            if (dashboardSection && dashboardSection.classList.contains('active')) {
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
            }

        } catch (error) {
            console.error('Error updating expense:', error);
            window.showMessage(error.message || 'Failed to update expense', 'error');
        }
    });
}

// Delete Expense
async function deleteExpense(expenseId) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        const response = await fetch(`${window.API_BASE_URL}/expenses/${expenseId}`, {
            method: 'DELETE',
            headers: window.getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'index.html';
                return;
            }
            throw new Error('Failed to delete expense');
        }

        window.showMessage('Expense deleted successfully!', 'success');
        loadExpenses(currentPage, currentFilter);

        // Refresh dashboard if on dashboard section
        const dashboardSection = document.getElementById('dashboardSection');
        if (dashboardSection && dashboardSection.classList.contains('active')) {
            if (typeof loadDashboardData === 'function') {
                loadDashboardData();
            }
        }

    } catch (error) {
        console.error('Error deleting expense:', error);
        window.showMessage(error.message || 'Failed to delete expense', 'error');
    }
}

// Make loadExpenses available globally
window.loadExpenses = loadExpenses;

// Category to Emoji mapping
const categoryEmojis = {
    'Food': '🍔',
    'Travel': '✈️',
    'Shopping': '🛍️',
    'Bills': '📄',
    'Entertainment': '🎬',
    'Healthcare': '🏥',
    'Education': '📚',
    'Groceries': '🛒',
    'Transportation': '🚗',
    'Utilities': '💡',
    'Rent': '🏠',
    'Salary': '💰',
    'Investment': '📈',
    'Gifts': '🎁',
    'Other': '📦'
};

// Function to get category display with emoji
function getCategoryDisplay(category) {
    const emoji = categoryEmojis[category] || '📦';
    return `${emoji} ${category}`;
}

// Add category badge styles dynamically
const style = document.createElement('style');
style.textContent = `
    .category-badge {
        display: inline-block;
        padding: 4px 12px;
        background-color: var(--bg-color);
        color: var(--primary-color);
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid var(--border-color);
    }
`;
document.head.appendChild(style);

// Initialize expenses on page load if on expenses section
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.checkAuth === 'function' && window.checkAuth()) {
        const expensesSection = document.getElementById('expensesSection');
        if (expensesSection && expensesSection.classList.contains('active')) {
            loadExpenses();
        }
    }
});