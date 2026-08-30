/* =====================================================
   ROYAL STORE BILLING SYSTEM
   FIREBASE FIRESTORE VERSION
   ===================================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =====================================================
   FIREBASE CONFIG
   ===================================================== */

const firebaseConfig = {
    apiKey: "AIzaSyBw4j-zNjSPi898H7U-z2LpD7W3hvJo6uM",
    authDomain: "royal-store-74fb3.firebaseapp.com",
    projectId: "royal-store-74fb3",
    storageBucket: "royal-store-74fb3.firebasestorage.app",
    messagingSenderId: "137094292552",
    appId: "1:137094292552:web:6bdca07bc91f88d3c2647d"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const productsRef = collection(db, "products");
const billsRef = collection(db, "bills");

let products = [];
let bills = [];
let cart = [];
let selectedBillToDelete = null;
let currentBillFilter = "today";


const defaultProducts = [
    { name: "Bath Soap", category: "Personal Care", price: 40, stock: 10, original: 10, alert: 2 },
    { name: "Potato Chips", category: "Snacks", price: 30, stock: 25, original: 25, alert: 5 },
    { name: "Vanilla Ice Cream", category: "Ice Cream", price: 80, stock: 8, original: 8, alert: 2 },
    { name: "Rice 5 KG", category: "Grocery", price: 320, stock: 15, original: 15, alert: 3 },
    { name: "Shampoo", category: "Personal Care", price: 120, stock: 12, original: 12, alert: 3 }
];


function money(value) {
    return "₹" + Number(value || 0).toFixed(2);
}


async function loadProducts() {
    try {
        const snapshot = await getDocs(productsRef);
        products = [];
        snapshot.forEach(item => {
            products.push({
                id: item.id,
                ...item.data()
            });
        });

        if (products.length === 0) {
            for (const product of defaultProducts) {
                const docRef = await addDoc(productsRef, product);
                products.push({
                    id: docRef.id,
                    ...product
                });
            }
        }

        updateQuickInfo();
        renderProducts();
        renderStock();
        renderCart();
    } catch (error) {
        console.error("Firebase products error:", error);
        showError("Unable to load products from Firebase.");
    }
}


async function loadBills() {
    try {
        const snapshot = await getDocs(billsRef);
        bills = [];
        snapshot.forEach(item => {
            bills.push({
                id: item.id,
                ...item.data()
            });
        });

        renderBills();
        generateNextBillNumber();
    } catch (error) {
        console.error("Firebase bills error:", error);
    }
}


async function saveBillToFirebase(bill) {
    const docRef = await addDoc(billsRef, bill);
    return docRef.id;
}


function openPage(page, button = null) {
    document.querySelectorAll(".page").forEach(item => {
        item.classList.add("hidden");
    });

    if (page === "billing") {
        document.getElementById("billingPage").classList.remove("hidden");
        document.getElementById("pageTitle").textContent = "New Bill";
    }

    if (page === "products") {
        document.getElementById("productsPage").classList.remove("hidden");
        document.getElementById("pageTitle").textContent = "Products";
        renderProducts();
    }

    if (page === "stock") {
        document.getElementById("stockPage").classList.remove("hidden");
        document.getElementById("pageTitle").textContent = "Stock";
        renderStock();
    }

    if (page === "bills") {
        document.getElementById("billsPage").classList.remove("hidden");
        document.getElementById("pageTitle").textContent = "Bill List";
        renderBills();
    }

    document.querySelectorAll(".menu-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }
}


function generateBillNumber() {
    let highest = 0;
    bills.forEach(bill => {
        const match = String(bill.number || "").match(/BILL-(\d+)/);
        if (match) {
            highest = Math.max(highest, Number(match[1]));
        }
    });
    return "BILL-" + String(highest + 1).padStart(4, "0");
}


function generateNextBillNumber() {
    const element = document.getElementById("billNumber");
    if (element) {
        element.textContent = generateBillNumber();
    }
}


const productSearch = document.getElementById("productSearch");
if (productSearch) {
    productSearch.addEventListener("input", function () {
        const value = this.value.trim().toLowerCase();
        const results = document.getElementById("searchResults");

        if (!value) {
            results.innerHTML = "";
            return;
        }

        const found = products.filter(product =>
            (product.name + " " + product.category).toLowerCase().includes(value) && product.stock > 0
        );

        if (found.length === 0) {
            results.innerHTML = `<div class="search-item">Product not found</div>`;
            return;
        }

        results.innerHTML = found.map(product => `
            <div class="search-item" onclick="addToCart('${product.id}')">
                <span>
                    <b>${escapeHTML(product.name)}</b>
                    <small>${escapeHTML(product.category)}</small>
                </span>
                <b>${money(product.price)}</b>
            </div>
        `).join("");
    });
}


function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        if (existing.quantity < product.stock) {
            existing.quantity++;
        } else {
            showError("Stock limit reached!");
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    if (productSearch) productSearch.value = "";
    const searchResults = document.getElementById("searchResults");
    if (searchResults) searchResults.innerHTML = "";
    
    renderCart();
}


function renderCart() {
    const body = document.getElementById("cartBody");
    if (!body) return;

    if (cart.length === 0) {
        body.innerHTML = `<tr><td colspan="5" class="empty">Search a product to add it to the bill</td></tr>`;
    } else {
        body.innerHTML = cart.map(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) return "";

            return `
                <tr>
                    <td><b>${escapeHTML(item.name)}</b></td>
                    <td>${money(item.price)}</td>
                    <td>
                        <input class="qty" type="number" min="1" max="${product.stock}" value="${item.quantity}" onchange="updateQuantity('${item.id}', this.value)">
                    </td>
                    <td>${money(item.price * item.quantity)}</td>
                    <td>
                        <button class="remove" onclick="removeCart('${item.id}')">×</button>
                    </td>
                </tr>
            `;
        }).join("");
    }
    updateBillSummary();
}


function updateQuantity(id, quantity) {
    const item = cart.find(x => x.id === id);
    const product = products.find(x => x.id === id);
    if (!item || !product) return;

    quantity = Number(quantity);
    if (quantity < 1) quantity = 1;
    if (quantity > product.stock) quantity = product.stock;

    item.quantity = quantity;
    renderCart();
}


function removeCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}


function updateBillSummary() {
    let items = 0;
    let total = 0;

    cart.forEach(item => {
        items += item.quantity;
        total += item.price * item.quantity;
    });

    const totalItemsEl = document.getElementById("totalItems");
    const subtotalEl = document.getElementById("subtotal");
    const grandTotalEl = document.getElementById("grandTotal");

    if (totalItemsEl) totalItemsEl.textContent = items;
    if (subtotalEl) subtotalEl.textContent = money(total);
    if (grandTotalEl) grandTotalEl.textContent = money(total);
}


async function completeBill() {
    if (cart.length === 0) {
        showError("Please add products first.");
        return;
    }

    try {
        for (const item of cart) {
            const product = products.find(p => p.id === item.id);
            if (!product) {
                showError("Product not found.");
                return;
            }
            if (item.quantity > product.stock) {
                showError("Not enough stock: " + product.name);
                return;
            }
        }

        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
        });

        const paymentMethodEl = document.getElementById("paymentMethod");
        const payment = paymentMethodEl ? paymentMethodEl.value : "Cash";

        const bill = {
            number: generateBillNumber(),
            date: new Date().toLocaleString("en-IN"),
            timestamp: Date.now(),
            payment: payment,
            items: [...cart],
            total: total
        };

        const firebaseBillId = await saveBillToFirebase(bill);
        bill.id = firebaseBillId;

        for (const item of cart) {
            const product = products.find(p => p.id === item.id);
            const newStock = product.stock - item.quantity;
            await updateDoc(doc(db, "products", product.id), { stock: newStock });
            product.stock = newStock;
        }

        bills.push(bill);
        printReceipt(bill);
        showSuccess("Bill " + bill.number + " completed successfully!");

        cart = [];
        renderCart();
        renderProducts();
        renderStock();
        renderBills();
        updateQuickInfo();
        generateNextBillNumber();
    } catch (error) {
        console.error("Complete bill error:", error);
        showError("Bill save failed. Please check Firebase connection.");
    }
}


function clearCart() {
    cart = [];
    renderCart();
}


function printCurrentBill() {
    if (cart.length === 0) {
        showError("Cart is empty.");
        return;
    }

    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    const paymentMethodEl = document.getElementById("paymentMethod");
    const bill = {
        number: document.getElementById("billNumber") ? document.getElementById("billNumber").textContent : "BILL-0001",
        date: new Date().toLocaleString("en-IN"),
        payment: paymentMethodEl ? paymentMethodEl.value : "Cash",
        items: [...cart],
        total: total
    };

    printReceipt(bill);
}


function printSavedBill(id) {
    const bill = bills.find(b => b.id === id);
    if (!bill) {
        showError("Bill not found.");
        return;
    }
    printReceipt(bill);
}


function printReceipt(bill) {
    const itemsHTML = (bill.items || []).map(item => `
        <div class="print-item">
            <span>${escapeHTML(item.name)} x${item.quantity}</span>
            <span>${money(item.price * item.quantity)}</span>
        </div>
    `).join("");

    const printWindow = window.open("", "_blank", "width=420,height=700");
    if (!printWindow) {
        showError("Please allow pop-ups to print the bill.");
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${escapeHTML(bill.number)} - Royal Store</title>
            <style>
                * { box-sizing: border-box; }
                body { margin: 0; padding: 12px; width: 80mm; font-family: "Courier New", monospace; color: #000; font-size: 12px; }
                .store-name { text-align: center; font-size: 21px; font-weight: bold; margin-bottom: 3px; }
                .center { text-align: center; }
                .line { border-top: 1px dashed #000; margin: 8px 0; }
                .details { line-height: 1.6; }
                .print-item { display: flex; justify-content: space-between; gap: 10px; margin: 6px 0; }
                .total { display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; margin-top: 8px; }
                .thank { text-align: center; margin-top: 15px; font-weight: bold; }
                @page { size: 80mm auto; margin: 0; }
            </style>
        </head>
        <body>
            <div class="store-name">ROYAL STORE</div>
            <div class="center">Supermarket Billing</div>
            <div class="line"></div>
            <div class="details">
                Bill No: ${escapeHTML(bill.number)}<br>
                Date: ${escapeHTML(bill.date)}<br>
                Payment: ${escapeHTML(bill.payment)}
            </div>
            <div class="line"></div>
            ${itemsHTML}
            <div class="line"></div>
            <div class="total">
                <span>GRAND TOTAL</span>
                <span>${money(bill.total)}</span>
            </div>
            <div class="line"></div>
            <div class="thank">
                Thank You!<br>Visit Royal Store Again
            </div>
            <script>
                window.onafterprint = function () { window.close(); };
                window.onload = function () { window.focus(); window.print(); };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}


function renderProducts() {
    const table = document.getElementById("productTable");
    if (!table) return;

    const filter = document.getElementById("productFilter");
    const search = filter ? (filter.value || "").toLowerCase() : "";

    const filtered = products.filter(product =>
        (product.name + " " + product.category).toLowerCase().includes(search)
    );

    table.innerHTML = filtered.map(product => {
        let status = "Available";
        let css = "available";

        if (product.stock === 0) {
            status = "Out of Stock";
            css = "out";
        } else if (product.stock <= product.alert) {
            status = "Low Stock";
            css = "low";
        }

        return `
            <tr>
                <td><b>${escapeHTML(product.name)}</b></td>
                <td>${escapeHTML(product.category)}</td>
                <td>${money(product.price)}</td>
                <td>${product.stock}</td>
                <td>${product.alert}</td>
                <td><span class="status ${css}">${status}</span></td>
                <td>
                    <button class="btn green small" onclick="restock('${product.id}')">+ Stock</button>
                </td>
            </tr>
        `;
    }).join("");
}


function renderStock() {
    const table = document.getElementById("stockTable");
    if (!table) return;

    const warning = document.getElementById("stockWarning");
    const low = products.filter(p => p.stock <= p.alert);

    if (warning) {
        if (low.length > 0) {
            warning.innerHTML = `
                <div class="warning-box">
                    ⚠ <b>Low Stock:</b> ${low.map(p => escapeHTML(p.name) + " (" + p.stock + " left)").join(", ")}
                </div>
            `;
        } else {
            warning.innerHTML = "";
        }
    }

    table.innerHTML = products.map(product => {
        const used = product.original - product.stock;
        const percentage = product.original > 0 ? Math.round((used / product.original) * 100) : 0;

        let status = "Available";
        let css = "available";

        if (product.stock === 0) {
            status = "Out of Stock";
            css = "out";
        } else if (product.stock <= product.alert) {
            status = "Low Stock";
            css = "low";
        }

        return `
            <tr>
                <td><b>${escapeHTML(product.name)}</b></td>
                <td>${escapeHTML(product.category)}</td>
                <td>${product.stock}</td>
                <td>${product.original}</td>
                <td>${used}</td>
                <td>${percentage}%</td>
                <td><span class="status ${css}">${status}</span></td>
                <td>
                    <button class="btn green small" onclick="restock('${product.id}')">+ Stock</button>
                </td>
            </tr>
        `;
    }).join("");
}


async function restock(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const amount = Number(prompt("How many stock to add?", 10));
    if (!amount || amount <= 0) return;

    try {
        const newStock = product.stock + amount;
        const newOriginal = (product.original || product.stock) + amount;

        await updateDoc(doc(db, "products", id), {
            stock: newStock,
            original: newOriginal
        });

        product.stock = newStock;
        product.original = newOriginal;

        renderProducts();
        renderStock();
        updateQuickInfo();
        showSuccess("Stock updated successfully!");
    } catch (error) {
        console.error(error);
        showError("Stock update failed.");
    }
}


function openProductModal() {
    const modal = document.getElementById("productModal");
    if (modal) modal.classList.remove("hidden");
}


function closeProductModal() {
    const modal = document.getElementById("productModal");
    if (modal) modal.classList.add("hidden");
}


async function saveProduct() {
    const nameEl = document.getElementById("productName");
    const categoryEl = document.getElementById("productCategory");
    const priceEl = document.getElementById("productPrice");
    const stockEl = document.getElementById("productStock");
    const alertEl = document.getElementById("productAlert");

    if (!nameEl || !categoryEl || !priceEl || !stockEl || !alertEl) return;

    const name = nameEl.value.trim();
    const category = categoryEl.value.trim();
    const price = Number(priceEl.value);
    const stock = Number(stockEl.value);
    const alertLevel = Number(alertEl.value);

    if (!name || !category || price <= 0 || stock < 0 || alertLevel < 0) {
        showError("Please enter valid product details.");
        return;
    }

    try {
        const product = {
            name: name,
            category: category,
            price: price,
            stock: stock,
            original: stock,
            alert: alertLevel,
            createdAt: Date.now()
        };

        const docRef = await addDoc(productsRef, product);
        products.push({
            id: docRef.id,
            ...product
        });

        nameEl.value = "";
        categoryEl.value = "";
        priceEl.value = "";
        stockEl.value = "";
        alertEl.value = "";

        closeProductModal();
        renderProducts();
        renderStock();
        updateQuickInfo();
        showSuccess("Product added successfully!");
    } catch (error) {
        console.error(error);
        showError("Product save failed.");
    }
}


function renderBills() {
    const table = document.getElementById("billTable");
    if (!table) return;

    const filteredBills = getFilteredBills(currentBillFilter);
    updateReportCards(filteredBills);

    if (filteredBills.length === 0) {
        table.innerHTML = `<tr><td colspan="6" class="empty">No bills found for this period.</td></tr>`;
        return;
    }

    table.innerHTML = filteredBills.slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).map(bill => {
        const itemCount = (bill.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

        return `
            <tr>
                <td><b>${escapeHTML(bill.number)}</b></td>
                <td>${escapeHTML(bill.date)}</td>
                <td>${itemCount}</td>
                <td><b>${money(bill.total)}</b></td>
                <td><span class="payment-badge">${escapeHTML(bill.payment)}</span></td>
                <td>
                    <div class="bill-actions">
                        <button class="btn blue small" onclick="printSavedBill('${bill.id}')">🖨 Print</button>
                        <button class="btn danger small" onclick="deleteBill('${bill.id}')">🗑 Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}


function filterBills(period, button) {
    currentBillFilter = period;
    document.querySelectorAll(".report-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    if (button) {
        button.classList.add("active");
    }
    renderBills();
}


function getFilteredBills(period) {
    if (period === "all") return [...bills];

    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (period === "today") {
        return bills.filter(bill => {
            const date = getBillDate(bill);
            return date >= startDate;
        });
    }

    if (period === "week") {
        const day = startDate.getDay();
        const difference = day === 0 ? 6 : day - 1;
        startDate.setDate(startDate.getDate() - difference);
        startDate.setHours(0, 0, 0, 0);

        return bills.filter(bill => {
            const date = getBillDate(bill);
            return date >= startDate;
        });
    }

    if (period === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        return bills.filter(bill => {
            const date = getBillDate(bill);
            return date >= startDate;
        });
    }

    return [];
}


function getBillDate(bill) {
    if (bill.timestamp) return new Date(bill.timestamp);
    if (bill.date) {
        const parsed = new Date(bill.date);
        if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date(0);
}


function updateReportCards(filteredBills) {
    let itemCount = 0;
    let sales = 0;

    filteredBills.forEach(bill => {
        sales += Number(bill.total || 0);
        itemCount += (bill.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    });

    const count = filteredBills.length;
    const average = count > 0 ? sales / count : 0;

    const reportBillCount = document.getElementById("reportBillCount");
    const reportItemCount = document.getElementById("reportItemCount");
    const reportSalesTotal = document.getElementById("reportSalesTotal");
    const reportAverage = document.getElementById("reportAverage");

    if (reportBillCount) reportBillCount.textContent = count;
    if (reportItemCount) reportItemCount.textContent = itemCount;
    if (reportSalesTotal) reportSalesTotal.textContent = money(sales);
    if (reportAverage) reportAverage.textContent = money(average);
}


function deleteBill(id) {
    const bill = bills.find(b => b.id === id);
    if (!bill) {
        showError("Bill not found.");
        return;
    }
    selectedBillToDelete = id;
    const modal = document.getElementById("deleteModal");
    if (modal) modal.classList.remove("hidden");
}


function closeDeleteModal() {
    selectedBillToDelete = null;
    const modal = document.getElementById("deleteModal");
    if (modal) modal.classList.add("hidden");
}


async function confirmDeleteBill() {
    if (!selectedBillToDelete) return;
    const id = selectedBillToDelete;

    try {
        await deleteDoc(doc(db, "bills", id));
        bills = bills.filter(bill => bill.id !== id);
        closeDeleteModal();
        renderBills();
        generateNextBillNumber();
        showSuccess("Bill deleted successfully.");
    } catch (error) {
        console.error("Delete bill error:", error);
        closeDeleteModal();
        showError("Unable to delete bill.");
    }
}


function showSuccess(message) {
    const toast = document.getElementById("successToast");
    const messageElement = document.getElementById("successMessage");
    if (!toast || !messageElement) return;

    messageElement.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3200);
}


function showError(message) {
    const toast = document.getElementById("successToast");
    const messageElement = document.getElementById("successMessage");
    if (!toast || !messageElement) return;

    const icon = toast.querySelector(".success-icon");
    if (icon) {
        icon.textContent = "!";
        icon.classList.add("error-icon");
    }

    toast.classList.add("show");
    messageElement.textContent = message;

    setTimeout(() => {
        toast.classList.remove("show");
        if (icon) {
            icon.textContent = "✓";
            icon.classList.remove("error-icon");
        }
    }, 3200);
}


function updateQuickInfo() {
    const productCount = document.getElementById("productCount");
    const quickLowStock = document.getElementById("quickLowStock");
    const lowStockCount = document.getElementById("lowStockCount");

    const low = products.filter(p => p.stock <= p.alert).length;

    if (productCount) productCount.textContent = products.length;
    if (quickLowStock) quickLowStock.textContent = low;
    if (lowStockCount) lowStockCount.textContent = low;
}


const productFilter = document.getElementById("productFilter");
if (productFilter) {
    productFilter.addEventListener("input", renderProducts);
}


const currentDateEl = document.getElementById("currentDate");
if (currentDateEl) {
    currentDateEl.textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


async function initializeAppData() {
    console.log("Connecting to Firebase...");
    await loadProducts();
    await loadBills();
    console.log("Royal Store Firebase backend ready.");
}

initializeAppData();


window.openPage = openPage;
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeCart = removeCart;
window.completeBill = completeBill;
window.clearCart = clearCart;
window.printCurrentBill = printCurrentBill;
window.printSavedBill = printSavedBill;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.saveProduct = saveProduct;
window.restock = restock;
window.filterBills = filterBills;
window.deleteBill = deleteBill;
window.closeDeleteModal = closeDeleteModal;
window.confirmDeleteBill = confirmDeleteBill;

