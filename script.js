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
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =====================================================
   FIREBASE CONFIG
   ===================================================== */

const firebaseConfig = {

    apiKey: "AIzaSyBw4j-zNjSPi898H7U-z2LpD7W3hvJo6uM",

    authDomain:
        "royal-store-74fb3.firebaseapp.com",

    projectId:
        "royal-store-74fb3",

    storageBucket:
        "royal-store-74fb3.firebasestorage.app",

    messagingSenderId:
        "137094292552",

    appId:
        "1:137094292552:web:6bdca07bc91f88d3c2647d"

};


/* =====================================================
   INITIALIZE FIREBASE
   ===================================================== */

const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);


/* =====================================================
   FIRESTORE COLLECTIONS
   ===================================================== */

const productsRef =
    collection(db, "products");

const billsRef =
    collection(db, "bills");


/* =====================================================
   DATA
   ===================================================== */

let products = [];

let bills = [];

let cart = [];


/* =====================================================
   DEFAULT PRODUCTS
   ===================================================== */

const defaultProducts = [

    {
        name: "Bath Soap",
        category: "Personal Care",
        price: 40,
        stock: 10,
        original: 10,
        alert: 2
    },

    {
        name: "Potato Chips",
        category: "Snacks",
        price: 30,
        stock: 25,
        original: 25,
        alert: 5
    },

    {
        name: "Vanilla Ice Cream",
        category: "Ice Cream",
        price: 80,
        stock: 8,
        original: 8,
        alert: 2
    },

    {
        name: "Rice 5 KG",
        category: "Grocery",
        price: 320,
        stock: 15,
        original: 15,
        alert: 3
    },

    {
        name: "Shampoo",
        category: "Personal Care",
        price: 120,
        stock: 12,
        original: 12,
        alert: 3
    }

];


/* =====================================================
   MONEY
   ===================================================== */

function money(value) {

    return "₹" +
        Number(value).toFixed(2);

}


/* =====================================================
   LOAD PRODUCTS FROM FIREBASE
   ===================================================== */

async function loadProducts() {

    try {

        const snapshot =
            await getDocs(productsRef);

        products = [];

        snapshot.forEach(item => {

            products.push({

                id: item.id,

                ...item.data()

            });

        });


        /*
         FIRST TIME ONLY:
         If Firebase is empty,
         add default products.
        */

        if (products.length === 0) {

            console.log(
                "No products found. Adding default products..."
            );


            for (
                const product
                of defaultProducts
            ) {

                const docRef =
                    await addDoc(
                        productsRef,
                        product
                    );


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

        renderSearch();


    }

    catch (error) {

        console.error(
            "Firebase products error:",
            error
        );

        alert(
            "Unable to load products from Firebase."
        );

    }

}


/* =====================================================
   LOAD BILLS FROM FIREBASE
   ===================================================== */

async function loadBills() {

    try {

        const snapshot =
            await getDocs(billsRef);

        bills = [];

        snapshot.forEach(item => {

            bills.push({

                id: item.id,

                ...item.data()

            });

        });


        renderBills();

        generateNextBillNumber();

    }

    catch (error) {

        console.error(
            "Firebase bills error:",
            error
        );

    }

}


/* =====================================================
   SAVE BILL TO FIREBASE
   ===================================================== */

async function saveBillToFirebase(bill) {

    const docRef =
        await addDoc(
            billsRef,
            bill
        );

    return docRef.id;

}


/* =====================================================
   PAGE SWITCH
   ===================================================== */

function openPage(
    page,
    button = null
) {


    document
        .querySelectorAll(".page")
        .forEach(item => {

            item.classList.add(
                "hidden"
            );

        });


    if (page === "billing") {

        document
            .getElementById(
                "billingPage"
            )
            .classList.remove(
                "hidden"
            );

        document.getElementById(
            "pageTitle"
        ).textContent =
            "New Bill";

    }


    if (page === "products") {

        document
            .getElementById(
                "productsPage"
            ).classList.remove(
                "hidden"
            );

        document.getElementById(
            "pageTitle"
        ).textContent =
            "Products";

        renderProducts();

    }


    if (page === "stock") {

        document
            .getElementById(
                "stockPage"
            ).classList.remove(
                "hidden"
            );

        document.getElementById(
            "pageTitle"
        ).textContent =
            "Stock";

        renderStock();

    }


    if (page === "bills") {

        document
            .getElementById(
                "billsPage"
            ).classList.remove(
                "hidden"
            );

        document.getElementById(
            "pageTitle"
        ).textContent =
            "Bill List";

        renderBills();

    }


    document
        .querySelectorAll(".menu-btn")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });


    if (button) {

        button.classList.add(
            "active"
        );

    }

}


/* =====================================================
   BILL NUMBER
   ===================================================== */

function generateBillNumber() {

    return "BILL-" +
        String(
            bills.length + 1
        ).padStart(
            4,
            "0"
        );

}


function generateNextBillNumber() {

    const element =
        document.getElementById(
            "billNumber"
        );

    if (element) {

        element.textContent =
            generateBillNumber();

    }

}


/* =====================================================
   PRODUCT SEARCH
   ===================================================== */

const productSearch =
    document.getElementById(
        "productSearch"
    );


productSearch.addEventListener(
    "input",
    function () {

        const value =
            this.value
                .trim()
                .toLowerCase();


        const results =
            document.getElementById(
                "searchResults"
            );


        if (!value) {

            results.innerHTML = "";

            return;

        }


        const found =
            products.filter(
                product =>

                    (
                        product.name +
                        " " +
                        product.category
                    )
                    .toLowerCase()
                    .includes(value)

                    &&

                    product.stock > 0
            );


        if (
            found.length === 0
        ) {

            results.innerHTML = `

                <div class="search-item">

                    Product not found

                </div>

            `;

            return;

        }


        results.innerHTML =

            found.map(
                product => {

                    return `

                        <div
                            class="search-item"
                            onclick="
                                addToCart(
                                    '${product.id}'
                                )
                            "
                        >

                            <span>

                                <b>
                                    ${product.name}
                                </b>

                                <small>
                                    ${product.category}
                                </small>

                            </span>

                            <b>

                                ${money(
                                    product.price
                                )}

                            </b>

                        </div>

                    `;

                }
            ).join("");

    }
);


/* =====================================================
   ADD TO CART
   ===================================================== */

function addToCart(id) {

    const product =
        products.find(
            p => p.id === id
        );


    if (!product) {

        return;

    }


    const existing =
        cart.find(
            item => item.id === id
        );


    if (existing) {

        if (
            existing.quantity <
            product.stock
        ) {

            existing.quantity++;

        }

        else {

            alert(
                "Stock limit reached!"
            );

        }

    }

    else {

        cart.push({

            id:
                product.id,

            name:
                product.name,

            price:
                product.price,

            quantity:
                1

        });

    }


    productSearch.value = "";

    document.getElementById(
        "searchResults"
    ).innerHTML = "";


    renderCart();

}


/* =====================================================
   RENDER CART
   ===================================================== */

function renderCart() {

    const body =
        document.getElementById(
            "cartBody"
        );


    if (
        cart.length === 0
    ) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty"
                >

                    Search a product
                    to add it to the bill

                </td>

            </tr>

        `;

    }

    else {

        body.innerHTML =

            cart.map(
                item => {

                    const product =
                        products.find(
                            p =>
                                p.id ===
                                item.id
                        );


                    if (!product) {

                        return "";

                    }


                    return `

                        <tr>

                            <td>

                                <b>
                                    ${item.name}
                                </b>

                            </td>


                            <td>

                                ${money(
                                    item.price
                                )}

                            </td>


                            <td>

                                <input
                                    class="qty"
                                    type="number"
                                    min="1"
                                    max="${product.stock}"
                                    value="${item.quantity}"
                                    onchange="
                                        updateQuantity(
                                            '${item.id}',
                                            this.value
                                        )
                                    "
                                >

                            </td>


                            <td>

                                ${money(
                                    item.price *
                                    item.quantity
                                )}

                            </td>


                            <td>

                                <button
                                    class="remove"
                                    onclick="
                                        removeCart(
                                            '${item.id}'
                                        )
                                    "
                                >

                                    ×

                                </button>

                            </td>

                        </tr>

                    `;

                }
            ).join("");

    }


    updateBillSummary();

}


/* =====================================================
   UPDATE QUANTITY
   ===================================================== */

function updateQuantity(
    id,
    quantity
) {

    const item =
        cart.find(
            x => x.id === id
        );


    const product =
        products.find(
            x => x.id === id
        );


    if (!item || !product) {

        return;

    }


    quantity =
        Number(quantity);


    if (
        quantity < 1
    ) {

        quantity = 1;

    }


    if (
        quantity >
        product.stock
    ) {

        quantity =
            product.stock;

    }


    item.quantity =
        quantity;


    renderCart();

}


/* =====================================================
   REMOVE CART
   ===================================================== */

function removeCart(id) {

    cart =
        cart.filter(
            item =>
                item.id !== id
        );


    renderCart();

}


/* =====================================================
   BILL SUMMARY
   ===================================================== */

function updateBillSummary() {

    let items = 0;

    let total = 0;


    cart.forEach(
        item => {

            items +=
                item.quantity;

            total +=
                item.price *
                item.quantity;

        }
    );


    document.getElementById(
        "totalItems"
    ).textContent =
        items;


    document.getElementById(
        "subtotal"
    ).textContent =
        money(total);


    document.getElementById(
        "grandTotal"
    ).textContent =
        money(total);

}


/* =====================================================
   COMPLETE BILL
   ===================================================== */

async function completeBill() {

    if (
        cart.length === 0
    ) {

        alert(
            "Please add products first."
        );

        return;

    }


    try {

        /*
         CHECK STOCK
        */

        for (
            const item
            of cart
        ) {

            const product =
                products.find(
                    p =>
                        p.id ===
                        item.id
                );


            if (!product) {

                alert(
                    "Product not found."
                );

                return;

            }


            if (
                item.quantity >
                product.stock
            ) {

                alert(
                    "Not enough stock: " +
                    product.name
                );

                return;

            }

        }


        /*
         CALCULATE TOTAL
        */

        let total = 0;


        cart.forEach(
            item => {

                total +=
                    item.price *
                    item.quantity;

            }
        );


        /*
         PAYMENT
        */

        const payment =
            document.getElementById(
                "paymentMethod"
            ).value;


        /*
         BILL OBJECT
        */

        const bill = {

            number:
                generateBillNumber(),

            date:
                new Date()
                    .toLocaleString(
                        "en-IN"
                    ),

            timestamp:
                Date.now(),

            payment:
                payment,

            items:
                [...cart],

            total:
                total

        };


        /*
         SAVE BILL
         */

        await saveBillToFirebase(
            bill
        );


        /*
         UPDATE FIREBASE STOCK
         */

        for (
            const item
            of cart
        ) {

            const product =
                products.find(
                    p =>
                        p.id ===
                        item.id
                );


            const newStock =
                product.stock -
                item.quantity;


            await updateDoc(
                doc(
                    db,
                    "products",
                    product.id
                ),
                {
                    stock:
                        newStock
                }
            );


            product.stock =
                newStock;

        }


        /*
         UPDATE LOCAL MEMORY
         */

        bills.push(bill);


        /*
         SUCCESS
         */

        createReceipt(
            bill
        );


        alert(
            "Bill completed successfully!"
        );


        /*
         CLEAR CART
         */

        cart = [];


        renderCart();

        renderProducts();

        renderStock();

        renderBills();

        updateQuickInfo();

        generateNextBillNumber();

    }

    catch (error) {

        console.error(
            error
        );

        alert(
            "Bill save failed. Please check Firebase connection."
        );

    }

}


/* =====================================================
   CLEAR CART
   ===================================================== */

function clearCart() {

    cart = [];

    renderCart();

}


/* =====================================================
   PRINT CURRENT BILL
   ===================================================== */

function printCurrentBill() {

    if (
        cart.length === 0
    ) {

        alert(
            "Cart is empty."
        );

        return;

    }


    let total = 0;


    cart.forEach(
        item => {

            total +=
                item.price *
                item.quantity;

        }
    );


    const bill = {

        number:
            document.getElementById(
                "billNumber"
            ).textContent,

        date:
            new Date()
                .toLocaleString(
                    "en-IN"
                ),

        payment:
            document.getElementById(
                "paymentMethod"
            ).value,

        items:
            [...cart],

        total:
            total

    };


    createReceipt(
        bill
    );


    window.print();

}


/* =====================================================
   CREATE RECEIPT
   ===================================================== */

function createReceipt(
    bill
) {

    let itemsHTML = "";


    bill.items.forEach(
        item => {

            itemsHTML += `

                <div
                    class="receipt-line"
                >

                    <span>

                        ${item.name}
                        x${item.quantity}

                    </span>

                    <span>

                        ${money(
                            item.price *
                            item.quantity
                        )}

                    </span>

                </div>

            `;

        }
    );


    document.getElementById(
        "receipt"
    ).innerHTML = `

        <h2>
            ROYAL STORE
        </h2>

        <div
            style="
                text-align:center;
                font-size:11px;
            "
        >

            Supermarket Billing

        </div>


        <hr>


        <p>

            Bill No:
            ${bill.number}

            <br>

            Date:
            ${bill.date}

            <br>

            Payment:
            ${bill.payment}

        </p>


        <hr>


        ${itemsHTML}


        <hr>


        <div
            class="receipt-line"
        >

            <b>
                GRAND TOTAL
            </b>

            <b>
                ${money(
                    bill.total
                )}
            </b>

        </div>


        <hr>


        <p
            style="
                text-align:center;
                font-size:11px;
            "
        >

            Thank You!

            <br>

            Visit Royal Store Again

        </p>

    `;

}


/* =====================================================
   PRODUCT PAGE
   ===================================================== */

function renderProducts() {

    const filter =
        document.getElementById(
            "productFilter"
        );


    if (!filter) {

        return;

    }


    const search =
        (
            filter.value || ""
        ).toLowerCase();


    const filtered =
        products.filter(
            product =>

                (
                    product.name +
                    " " +
                    product.category
                )
                .toLowerCase()
                .includes(search)

        );


    document.getElementById(
        "productTable"
    ).innerHTML =

        filtered.map(
            product => {

                let status =
                    "Available";

                let css =
                    "available";


                if (
                    product.stock === 0
                ) {

                    status =
                        "Out of Stock";

                    css =
                        "out";

                }

                else if (
                    product.stock <=
                    product.alert
                ) {

                    status =
                        "Low Stock";

                    css =
                        "low";

                }


                return `

                    <tr>

                        <td>

                            <b>
                                ${product.name}
                            </b>

                        </td>

                        <td>
                            ${product.category}
                        </td>

                        <td>
                            ${money(
                                product.price
                            )}
                        </td>

                        <td>
                            ${product.stock}
                        </td>

                        <td>
                            ${product.alert}
                        </td>

                        <td>

                            <span
                                class="
                                    status
                                    ${css}
                                "
                            >

                                ${status}

                            </span>

                        </td>

                        <td>

                            <button
                                class="
                                    btn
                                    green
                                    small
                                "
                                onclick="
                                    restock(
                                        '${product.id}'
                                    )
                                "
                            >

                                + Stock

                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =====================================================
   STOCK PAGE
   ===================================================== */

function renderStock() {

    const table =
        document.getElementById(
            "stockTable"
        );


    if (!table) {

        return;

    }


    const warning =
        document.getElementById(
            "stockWarning"
        );


    const low =
        products.filter(
            p =>
                p.stock <=
                p.alert
        );


    if (
        low.length > 0
    ) {

        warning.innerHTML = `

            <div
                class="warning-box"
            >

                ⚠
                <b>
                    Low Stock:
                </b>

                ${low.map(
                    p =>
                        p.name +
                        " (" +
                        p.stock +
                        " left)"
                ).join(", ")}

            </div>

        `;

    }

    else {

        warning.innerHTML = "";

    }


    table.innerHTML =

        products.map(
            product => {

                const used =
                    product.original -
                    product.stock;


                const percentage =
                    product.original > 0

                        ?

                    Math.round(
                        (
                            used /
                            product.original
                        ) *
                        100
                    )

                        :

                    0;


                let status =
                    "Available";

                let css =
                    "available";


                if (
                    product.stock === 0
                ) {

                    status =
                        "Out of Stock";

                    css =
                        "out";

                }

                else if (
                    product.stock <=
                    product.alert
                ) {

                    status =
                        "Low Stock";

                    css =
                        "low";

                }


                return `

                    <tr>

                        <td>

                            <b>
                                ${product.name}
                            </b>

                        </td>

                        <td>
                            ${product.category}
                        </td>

                        <td>
                            ${product.stock}
                        </td>

                        <td>
                            ${product.original}
                        </td>

                        <td>
                            ${used}
                        </td>

                        <td>
                            ${percentage}%
                        </td>

                        <td>

                            <span
                                class="
                                    status
                                    ${css}
                                "
                            >

                                ${status}

                            </span>

                        </td>

                        <td>

                            <button
                                class="
                                    btn
                                    green
                                    small
                                "
                                onclick="
                                    restock(
                                        '${product.id}'
                                    )
                                "
                            >

                                + Stock

                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =====================================================
   RESTOCK
   ===================================================== */

async function restock(id) {

    const product =
        products.find(
            p => p.id === id
        );


    if (!product) {

        return;

    }


    const amount =
        Number(
            prompt(
                "How many stock to add?",
                10
            )
        );


    if (
        !amount ||
        amount <= 0
    ) {

        return;

    }


    try {

        const newStock =
            product.stock +
            amount;


        const newOriginal =
            product.original +
            amount;


        await updateDoc(
            doc(
                db,
                "products",
                id
            ),
            {

                stock:
                    newStock,

                original:
                    newOriginal

            }
        );


        product.stock =
            newStock;


        product.original =
            newOriginal;


        renderProducts();

        renderStock();

        updateQuickInfo();


        alert(
            "Stock updated successfully!"
        );

    }

    catch (error) {

        console.error(
            error
        );

        alert(
            "Stock update failed."
        );

    }

}


/* =====================================================
   ADD PRODUCT MODAL
   ===================================================== */

function openProductModal() {

    document
        .getElementById(
            "productModal"
        )
        .classList
        .remove(
            "hidden"
        );

}


function closeProductModal() {

    document
        .getElementById(
            "productModal"
        )
        .classList
        .add(
            "hidden"
        );

}


/* =====================================================
   SAVE PRODUCT
   ===================================================== */

async function saveProduct() {

    const name =
        document.getElementById(
            "productName"
        ).value.trim();


    const category =
        document.getElementById(
            "productCategory"
        ).value.trim();


    const price =
        Number(
            document.getElementById(
                "productPrice"
            ).value
        );


    const stock =
        Number(
            document.getElementById(
                "productStock"
            ).value
        );


    const alertLevel =
        Number(
            document.getElementById(
                "productAlert"
            ).value
        );


    if (
        !name ||
        !category ||
        price <= 0 ||
        stock < 0 ||
        alertLevel < 0
    ) {

        alert(
            "Please enter valid product details."
        );

        return;

    }


    try {

        const product = {

            name:
                name,

            category:
                category,

            price:
                price,

            stock:
                stock,

            original:
                stock,

            alert:
                alertLevel,

            createdAt:
                Date.now()

        };


        const docRef =
            await addDoc(
                productsRef,
                product
            );


        products.push({

            id:
                docRef.id,

            ...product

        });


        /*
         CLEAR FORM
        */

        document.getElementById(
            "productName"
        ).value = "";


        document.getElementById(
            "productCategory"
        ).value = "";


        document.getElementById(
            "productPrice"
        ).value = "";


        document.getElementById(
            "productStock"
        ).value = "";


        document.getElementById(
            "productAlert"
        ).value = "";


        closeProductModal();


        renderProducts();

        renderStock();

        updateQuickInfo();


        alert(
            "Product added successfully!"
        );

    }

    catch (error) {

        console.error(
            error
        );

        alert(
            "Product save failed."
        );

    }

}


/* =====================================================
   BILL LIST
   ===================================================== */

function renderBills() {

    const table =
        document.getElementById(
            "billTable"
        );


    if (!table) {

        return;

    }


    if (
        bills.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty"
                >

                    No bills available.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =

        bills
            .slice()
            .sort(
                (
                    a,
                    b
                ) =>
                    (
                        b.timestamp ||
                        0
                    ) -
                    (
                        a.timestamp ||
                        0
                    )
            )
            .map(
                bill => {

                    return `

                        <tr>

                            <td>

                                <b>
                                    ${bill.number}
                                </b>

                            </td>

                            <td>
                                ${bill.date}
                            </td>

                            <td>
                                ${bill.items.reduce(
                                    (
                                        sum,
                                        item
                                    ) =>
                                        sum +
                                        item.quantity,
                                    0
                                )}
                            </td>

                            <td>

                                <b>
                                    ${money(
                                        bill.total
                                    )}
                                </b>

                            </td>

                            <td>
                                ${bill.payment}
                            </td>

                            <td>

                                <button
                                    class="
                                        btn
                                        blue
                                        small
                                    "
                                    onclick="
                                        printSavedBill(
                                            '${bill.id}'
                                        )
                                    "
                                >

                                    Print

                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   PRINT SAVED BILL
   ===================================================== */

function printSavedBill(
    id
) {

    const bill =
        bills.find(
            b => b.id === id
        );


    if (!bill) {

        alert(
            "Bill not found."
        );

        return;

    }


    createReceipt(
        bill
    );


    window.print();

}


/* =====================================================
   QUICK INFO
   ===================================================== */

function updateQuickInfo() {

    const productCount =
        document.getElementById(
            "productCount"
        );


    const quickLowStock =
        document.getElementById(
            "quickLowStock"
        );


    const lowStockCount =
        document.getElementById(
            "lowStockCount"
        );


    const low =
        products.filter(
            p =>
                p.stock <=
                p.alert
        ).length;


    if (productCount) {

        productCount.textContent =
            products.length;

    }


    if (quickLowStock) {

        quickLowStock.textContent =
            low;

    }


    if (lowStockCount) {

        lowStockCount.textContent =
            low;

    }

}


/* =====================================================
   PRODUCT FILTER
   ===================================================== */

document
    .getElementById(
        "productFilter"
    )
    .addEventListener(
        "input",
        renderProducts
    );


/* =====================================================
   DATE
   ===================================================== */

document.getElementById(
    "currentDate"
).textContent =

    new Date()
        .toLocaleDateString(
            "en-IN",
            {

                weekday:
                    "short",

                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric"

            }
        );


/* =====================================================
   SEARCH RENDER
   ===================================================== */

function renderSearch() {

    /*
     Nothing required here.
     Product search uses live products array.
    */

}


/* =====================================================
   INITIAL LOAD
   ===================================================== */

async function initializeAppData() {

    console.log(
        "Connecting to Firebase..."
    );


    await loadProducts();

    await loadBills();


    console.log(
        "Royal Store Firebase backend ready."
    );

}


initializeAppData();


/* =====================================================
   MAKE FUNCTIONS AVAILABLE TO HTML ONCLICK
   ===================================================== */

window.openPage =
    openPage;

window.addToCart =
    addToCart;

window.updateQuantity =
    updateQuantity;

window.removeCart =
    removeCart;

window.completeBill =
    completeBill;

window.clearCart =
    clearCart;

window.printCurrentBill =
    printCurrentBill;

window.openProductModal =
    openProductModal;

window.closeProductModal =
    closeProductModal;

window.saveProduct =
    saveProduct;

window.restock =
    restock;

window.printSavedBill =
    printSavedBill;
