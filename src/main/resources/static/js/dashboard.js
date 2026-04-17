// API Base URL
const API_BASE_URL = 'https://spending-h227.onrender.com/api';

// DOM Elements
const sidebar = document.getElementById('sidebar');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const logoutBtn = document.getElementById('logoutBtn');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const messageContainer = document.getElementById('messageContainer');

// Dashboard elements
const totalExpensesEl = document.getElementById('totalExpenses');
const highestExpenseEl = document.getElementById('highestExpense');
const totalTransactionsEl = document.getElementById('totalTransactions');
const recentActivityBody = document.getElementById('recentActivityBody');
const recentExpensesList = document.getElementById('recentExpensesList');

// Check authentication on page load
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }
    
    // Display welcome message with user's first name
    displayWelcomeMessage();
    
    return true;
}

// Display welcome message with user's first name
function displayWelcomeMessage() {
    const userFirstNameEl = document.getElementById('userFirstName');
    if (userFirstNameEl) {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const firstName = user.firstName || user.name || user.email || 'User';
                userFirstNameEl.textContent = firstName;
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            userFirstNameEl.textContent = 'User';
        }
    }
}

// Dark mode functionality
function initDarkMode() {
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    const themeToggle = document.getElementById('themeToggle');
    
    if (!darkModeSwitch || !themeToggle) {
        return;
    }
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        enableDarkMode();
        darkModeSwitch.checked = true;
    } else {
        enableLightMode();
        darkModeSwitch.checked = false;
    }
    
    // Add event listener for theme toggle
    darkModeSwitch.addEventListener('change', () => {
        if (darkModeSwitch.checked) {
            enableDarkMode();
            localStorage.setItem('theme', 'dark');
        } else {
            enableLightMode();
            localStorage.setItem('theme', 'light');
        }
    });
}

function enableDarkMode() {
    document.documentElement.setAttribute('data-theme', 'dark');
}

function enableLightMode() {
    document.documentElement.removeAttribute('data-theme');
}

// Get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Utility function to show messages
function showMessage(message, type = 'success') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);

    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// Utility function to format currency
function formatCurrency(amount) {
    return `₹${parseFloat(amount).toFixed(2)}`;
}

// Utility function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Utility function to format time ago
function formatTimeAgo(dateString) {
    if (!dateString) return 'Just now';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
}

// Mobile menu toggle
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024 && 
        !sidebar.contains(e.target) && 
        !mobileMenuToggle.contains(e.target) &&
        sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
});

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = item.dataset.section;

        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Show corresponding section
        sections.forEach(section => section.classList.remove('active'));
        // Map sectionId to the correct element ID
        let targetSectionId;
        if (sectionId === 'add-expense') {
            targetSectionId = 'addExpenseSection';
        } else {
            targetSectionId = `${sectionId}Section`;
        }
        const targetSection = document.getElementById(targetSectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Close mobile menu
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('open');
        }

        // Load data based on section
        if (sectionId === 'dashboard') {
            loadDashboardData();
        } else if (sectionId === 'expenses') {
            if (typeof loadExpenses === 'function') {
                loadExpenses();
            }
        }
    });
});

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showMessage('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
}

// Password change functionality
if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
        openChangePasswordModal();
    });
}

// Password change modal elements
const changePasswordModal = document.getElementById('changePasswordModal');
const changePasswordForm = document.getElementById('changePasswordForm');
const closePasswordModal = document.getElementById('closePasswordModal');
const cancelPasswordChange = document.getElementById('cancelPasswordChange');

// Open password change modal
function openChangePasswordModal() {
    if (changePasswordModal) {
        changePasswordModal.classList.add('active');
        // Clear form fields
        if (changePasswordForm) {
            changePasswordForm.reset();
        }
    }
}

// Close password change modal
function closeChangePasswordModal() {
    if (changePasswordModal) {
        changePasswordModal.classList.remove('active');
    }
}

// Handle password change form submission
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showMessage('New passwords do not match', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showMessage('New password must be at least 6 characters long', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    oldPassword: currentPassword,
                    newPassword: newPassword
                })
            });
            
            if (response.ok) {
                showMessage('Password changed successfully!', 'success');
                closeChangePasswordModal();
                changePasswordForm.reset();
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Failed to change password';
                showMessage(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            showMessage('An error occurred while changing password', 'error');
        }
    });
}

// Close modal when clicking close button or cancel
if (closePasswordModal) {
    closePasswordModal.addEventListener('click', closeChangePasswordModal);
}

if (cancelPasswordChange) {
    cancelPasswordChange.addEventListener('click', closeChangePasswordModal);
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (changePasswordModal && changePasswordModal.classList.contains('active')) {
        if (!changePasswordModal.contains(e.target) && e.target !== changePasswordBtn) {
            closeChangePasswordModal();
        }
    }
});

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load monthly total and display it in Total Expenses
        await loadMonthlyTotal();

        // Load highest expense
        await loadHighestExpense();

        // Load total transactions
        await loadTotalTransactions();

        // Load recent activity
        loadRecentActivity();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showMessage('Failed to load dashboard data', 'error');
    }
}

// Load monthly total and display in Total Expenses
async function loadMonthlyTotal() {
    try {
        const response = await fetch(`${API_BASE_URL}/expenses/monthly-total`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to load monthly total');
        }

        const data = await response.json();
        
        // Handle both simple value and object responses
        let total = 0;
        if (typeof data === 'number') {
            total = data;
        } else if (data.total || data.amount || data.value) {
            total = data.total || data.amount || data.value;
        }
        
        totalExpensesEl.textContent = formatCurrency(total);

    } catch (error) {
        console.error('Error loading monthly total:', error);
        // Set default value if failed to load
        totalExpensesEl.textContent = formatCurrency(0);
    }
}

// Load highest expense
async function loadHighestExpense() {
    try {
        const response = await fetch(`${API_BASE_URL}/expenses/highest`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to load highest expense');
        }

        const data = await response.json();
        
        // Handle both simple value and object responses
        let highest = 0;
        if (typeof data === 'number') {
            highest = data;
        } else if (data.amount || data.value || data.highest) {
            highest = data.amount || data.value || data.highest;
        }
        
        highestExpenseEl.textContent = formatCurrency(highest);

    } catch (error) {
        console.error('Error loading highest expense:', error);
        // Set default value if failed to load
        highestExpenseEl.textContent = formatCurrency(0);
    }
}

// Load total transactions
async function loadTotalTransactions() {
    try {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to load total transactions');
        }

        const data = await response.json();
        
        // Handle both simple array and object responses
        let total = 0;
        if (Array.isArray(data)) {
            total = data.length;
        } else if (data.totalTransactions || data.count || data.total) {
            total = data.totalTransactions || data.count || data.total;
        }
        
        totalTransactionsEl.textContent = total;

    } catch (error) {
        console.error('Error loading total transactions:', error);
        // Set default value if failed to load
        totalTransactionsEl.textContent = 0;
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const response = await fetch(`${API_BASE_URL}/expenses/recent`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to load recent activity');
        }

        const data = await response.json();
        const activities = Array.isArray(data) ? data : (data.content || []);

        if (activities.length === 0) {
            recentActivityBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        <div class="empty-state">
                            <div class="empty-state-icon">📭</div>
                            <h3>No recent activity</h3>
                            <p>Start adding your expenses to see activity here</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        recentActivityBody.innerHTML = activities.map(activity => {
            // Determine action type (assuming API returns an action field)
            let actionIcon = '✅';
            let actionText = 'Added';
            
            if (activity.action) {
                if (activity.action.toLowerCase() === 'update' || activity.action.toLowerCase() === 'edit') {
                    actionIcon = '✏️';
                    actionText = 'Updated';
                } else if (activity.action.toLowerCase() === 'delete') {
                    actionIcon = '❌';
                    actionText = 'Deleted';
                } else if (activity.action.toLowerCase() === 'add' || activity.action.toLowerCase() === 'create') {
                    actionIcon = '✅';
                    actionText = 'Added';
                }
            }

            // Format time (assuming activity has a timestamp field)
            let timeAgo = 'Just now';
            if (activity.timestamp || activity.time || activity.date) {
                timeAgo = formatTimeAgo(activity.timestamp || activity.time || activity.date);
            }

            return `
                <tr>
                    <td><span class="action-badge">${actionIcon} ${actionText}</span></td>
                    <td>${activity.title || 'N/A'}</td>
                    <td>${formatCurrency(activity.amount || 0)}</td>
                    <td>${timeAgo}</td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

// Load recent expenses (fallback for old format)
async function loadRecentExpenses() {
    try {
        const response = await fetch(`${API_BASE_URL}/expenses?page=0&size=5`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to load recent expenses');
        }

        const data = await response.json();
        const expenses = data.content || [];

        if (expenses.length === 0) {
            recentExpensesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3>No recent expenses</h3>
                    <p>Start adding your expenses to see them here</p>
                </div>
            `;
            return;
        }

        recentExpensesList.innerHTML = expenses.map(expense => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <h4>${expense.title}</h4>
                    <p>${expense.category} • ${formatDate(expense.date)}</p>
                </div>
                <div class="recent-item-amount">${formatCurrency(expense.amount)}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading recent expenses:', error);
    }
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode toggle
    initDarkMode();
    
    if (checkAuth()) {
        loadDashboardData();
    }
    
    // Initialize password visibility toggle for dashboard
    initPasswordToggle();
});

// Password visibility toggle functionality for dashboard
function initPasswordToggle() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = this.querySelector('.eye-icon');
            
            if (passwordInput) {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                
                // Update icon based on state
                if (isPassword) {
                    eyeIcon.textContent = '👁️‍🗨️'; // Eye with slash or different icon
                    this.setAttribute('aria-label', 'Hide password');
                } else {
                    eyeIcon.textContent = '👁️';
                    this.setAttribute('aria-label', 'Show password');
                }
            }
        });
    });
}

// PDF Export functionality for expenses
const saveAsPdfBtn = document.getElementById('saveAsPdfBtn');
if (saveAsPdfBtn) {
    saveAsPdfBtn.addEventListener('click', generateExpensePdf);
}

async function generateExpensePdf() {
    try {
        // Get current expenses data
        const expensesTableBody = document.getElementById('expensesTableBody');
        const rows = expensesTableBody.querySelectorAll('tr');
        
        if (rows.length === 0) {
            showMessage('No expenses to export', 'warning');
            return;
        }
        
        // Create a styled HTML content for PDF
        const pdfContent = createPdfContent(rows);
        
        // Generate PDF with html2pdf
        const opt = {
            margin: 10,
            filename: `expenses_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Show loading message
        saveAsPdfBtn.disabled = true;
        saveAsPdfBtn.innerHTML = '<span>⏳</span><span>Generating PDF...</span>';
        
        await html2pdf().set(opt).from(pdfContent).save();
        
        // Reset button
        saveAsPdfBtn.disabled = false;
        saveAsPdfBtn.innerHTML = '<span>📄</span><span>Save as PDF</span>';
        
        showMessage('PDF generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showMessage('Failed to generate PDF', 'error');
        saveAsPdfBtn.disabled = false;
        saveAsPdfBtn.innerHTML = '<span>📄</span><span>Save as PDF</span>';
    }
}

function createPdfContent(rows) {
    const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Calculate totals
    let totalAmount = 0;
    const categoryData = {};
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
            const amountText = cells[2].textContent.replace(/[₹,]/g, '').trim();
            const amount = parseFloat(amountText) || 0;
            totalAmount += amount;
            
            const category = cells[1].textContent.trim();
            categoryData[category] = (categoryData[category] || 0) + amount;
        }
    });
    
    // Get user name
    let userName = 'User';
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            userName = user.firstName || user.name || user.email || 'User';
        }
    } catch (e) {
        // Use default
    }
    
    // Create HTML content with inline styles for PDF
    const content = document.createElement('div');
    content.style.cssText = `
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #111827;
        padding: 20px;
        background: #ffffff;
    `;
    
    // Header with gradient background
    content.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; margin: -20px -20px 20px -20px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">💰 Expense Report</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Generated on ${today}</p>
            <p style="margin: 4px 0 0 0; opacity: 0.8; font-size: 13px;">Prepared by: ${userName}</p>
        </div>
        
        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; border-left: 4px solid #4f46e5;">
                <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Total Expenses</p>
                <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700; color: #4f46e5;">₹${totalAmount.toFixed(2)}</p>
            </div>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981;">
                <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Total Transactions</p>
                <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700; color: #10b981;">${rows.length}</p>
            </div>
        </div>
        
        <!-- Category Breakdown -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">📊 Category Breakdown</h2>
            ${Object.entries(categoryData).map(([category, amount]) => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-weight: 500;">${category}</span>
                    <span style="font-weight: 600; color: #4f46e5;">₹${amount.toFixed(2)}</span>
                </div>
            `).join('')}
        </div>
        
        <!-- Expenses Table -->
        <h2 style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">📋 Detailed Expenses</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
                <tr style="background: #4f46e5; color: white;">
                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Title</th>
                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Category</th>
                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Amount</th>
                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Date</th>
                </tr>
            </thead>
            <tbody>
                ${Array.from(rows).map((row, index) => {
                    const cells = row.querySelectorAll('td');
                    const title = cells[0].textContent.trim();
                    const category = cells[1].textContent.trim();
                    const amount = cells[2].textContent.trim();
                    const date = cells[3].textContent.trim();
                    const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                    return `
                        <tr style="background: ${bgColor};">
                            <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">${title}</td>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                                <span style="background: #e0e7ff; color: #4f46e5; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${category}</span>
                            </td>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #4f46e5;">${amount}</td>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${date}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        
        <!-- Footer -->
        <div style="text-align: center; padding: 20px; border-top: 2px solid #e5e7eb; margin-top: 20px;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This report was automatically generated by Spending Tracker
            </p>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #d1d5db;">
                © ${new Date().getFullYear()} Spending Tracker. All rights reserved.
            </p>
        </div>
    `;
    
    return content;
}

// Export functions for use in other scripts
window.showMessage = showMessage;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.getAuthHeaders = getAuthHeaders;
window.API_BASE_URL = API_BASE_URL;
window.checkAuth = checkAuth;