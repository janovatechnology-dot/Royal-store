/* =========================================
   ROYAL STORE BILLING SYSTEM
   ========================================= */


/* STORAGE */

const PRODUCT_STORAGE =
    "royal_store_products";

const BILL_STORAGE =
    "royal_store_bills";


/* PRODUCTS */

let products =
    JSON.parse(
        localStorage.getItem(PRODUCT_STORAGE)
    ) || [

        {
            id: 1,
            name: "Bath Soap",
            category: "Personal Care",
            price: 40,
            stock: 10,
            original: 10,
            alert: 2
        },

        {
            id: 2,
            name: "Potato Chips",
            category: "Snacks",
            price: 30,
            stock: 25,
            original: 25,
            alert: 5
        },

        {
            id: 3,
            name: "Vanilla Ice Cream",
            category: "Ice Cream",
            price: 80,
            stock: 8,
            original: 8,
            alert: 2
        },

        {
            id: 4,
            name: "Rice 5 KG",
            category: "Grocery",
            price: 320,
            stock: 15,
            original: 15,
            alert: 3
        },

        {
            id: 5,
            name: "Shampoo",
            category: "Personal Care",
            price: 120,
            stock: 12,
            original: 12,
            alert: 3
        }

    ];


/* BILLS */

let bills =
    JSON.parse(
        localStorage.getItem(BILL_STORAGE)
    ) || [];


/* CART */

let cart = [];


/* =========================================
   SAVE DATA
   ========================================= */

function saveData() {

    localStorage.setItem(
        PRODUCT_STORAGE,
        JSON.stringify(products)
    );

    localStorage.setItem(
        BILL_STORAGE,
        JSON.stringify(bills)
    );

}


/* =========================================
   MONEY
   ========================================= */

function money(value) {

    return "₹" +
        Number(value).toFixed(2);

}


/* =========================================
   PAGE SWITCH
   ========================================= */

function openPage(page, button = null) {


    document
        .querySelectorAll(".page")
        .forEach(item => {

            item.classList.add("hidden");

        });


    if (page === "billing") {

        document
            .getElementById("billingPage")
            .classList.remove("hidden");

        document.getElementById(
            "pageTitle"
        ).textContent = "New Bill";

    }


    if (page === "products") {

        document
            .getElementById("productsPage")
            .classList.remove("hidden");

        document.getElementById(
            "pageTitle"
        ).textContent = "Products";

        renderProducts();

    }


    if (page === "stock") {

        document
            .getElementById("stockPage")
            .classList.remove("hidden");

        document.getElementById(
            "pageTitle"
        ).textContent = "Stock";

        renderStock();

    }


    if (page === "bills") {

        document
            .getElementById("billsPage")
            .classList.remove("hidden");

        document.getElementById(
            "pageTitle"
        ).textContent = "Bill List";

        renderBills();

    }


    document
        .querySelectorAll(".menu-btn")
        .forEach(btn => {

            btn.classList.remove("active");

        });


    if (button) {

        button.classList.add("active");

    }

}



/* =========================================
   BILL NUMBER
   ========================================= */

function generateBillNumber() {

    return "BILL-" +
        String(
            bills.length + 1
        ).padStart(4, "0");

}


document.getElementById(
    "billNumber"
).textContent =
    generateBillNumber();



/* =========================================
   PRODUCT SEARCH
   ========================================= */

document
    .getElementById("productSearch")
    .addEventListener(
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
                products.filter(product =>

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


            if (found.length === 0) {

                results.innerHTML = `

                    <div class="search-item">

                        Product not found

                    </div>

                `;

                return;

            }


            results.innerHTML =

                found.map(product => {

                    return `

                        <div
                            class="search-item"
                            onclick="
                                addToCart(
                                    ${product.id}
                                )
                            ">

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

                }).join("");

        }
    );



/* =========================================
   ADD CART
   ========================================= */

function addToCart(id) {

    const product =
        products.find(
            p => p.id === id
        );


    if (!product) return;


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

            id: product.id,

            name: product.name,

            price: product.price,

            quantity: 1

        });

    }


    document.getElementById(
        "productSearch"
    ).value = "";


    document.getElementById(
        "searchResults"
    ).innerHTML = "";


    renderCart();

}



/* =========================================
   RENDER CART
   ========================================= */

function renderCart() {

    const body =
        document.getElementById(
            "cartBody"
        );


    if (cart.length === 0) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty">

                    Search a product
                    to add it to the bill

                </td>

            </tr>

        `;

    }

    else {

        body.innerHTML =

            cart.map(item => {

                const product =
                    products.find(
                        p => p.id === item.id
                    );


                return `

                    <tr>

                        <td>
                            <b>
                                ${item.name}
                            </b>
                        </td>


                        <td>
                            ${money(item.price)}
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
                                        ${item.id},
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
                                        ${item.id}
                                    )
                                ">

                                ×

                            </button>

                        </td>

                    </tr>

                `;

            }).join("");

    }


    updateBillSummary();

}



/* =========================================
   UPDATE QUANTITY
   ========================================= */

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


    quantity =
        Number(quantity);


    if (quantity < 1) {

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



/* =========================================
   REMOVE CART
   ========================================= */

function removeCart(id) {

    cart =
        cart.filter(
            item => item.id !== id
        );


    renderCart();

}



/* =========================================
   BILL SUMMARY
   ========================================= */

function updateBillSummary() {

    let items = 0;

    let total = 0;


    cart.forEach(item => {

        items += item.quantity;

        total +=
            item.price *
            item.quantity;

    });


    document.getElementById(
        "totalItems"
    ).textContent = items;


    document.getElementById(
        "subtotal"
    ).textContent =
        money(total);


    document.getElementById(
        "grandTotal"
    ).textContent =
        money(total);

}



/* =========================================
   COMPLETE BILL
   ========================================= */

function completeBill() {


    if (cart.length === 0) {

        alert(
            "Please add products first."
        );

        return;

    }


    /* CHECK STOCK */

    for (const item of cart) {

        const product =
            products.find(
                p => p.id === item.id
            );


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


    /* REDUCE STOCK */

    cart.forEach(item => {

        const product =
            products.find(
                p => p.id === item.id
            );


        product.stock -=
            item.quantity;

    });


    let total = 0;


    cart.forEach(item => {

        total +=
            item.price *
            item.quantity;

    });


    const bill = {

        number:
            generateBillNumber(),

        date:
            new Date()
                .toLocaleString("en-IN"),

        payment:
            document.getElementById(
                "paymentMethod"
            ).value,

        items:
            [...cart],

        total:
            total

    };


    bills.push(bill);


    saveData();


    createReceipt(bill);


    alert(
        "Bill completed successfully!"
    );


    cart = [];


    renderCart();


    updateQuickInfo();


    generateNextBillNumber();

}



/* =========================================
   NEXT BILL NUMBER
   ========================================= */

function generateNextBillNumber() {

    document.getElementById(
        "billNumber"
    ).textContent =
        generateBillNumber();

}



/* =========================================
   CLEAR CART
   ========================================= */

function clearCart() {

    cart = [];

    renderCart();

}



/* =========================================
   PRINT CURRENT BILL
   ========================================= */

function printCurrentBill() {

    if (cart.length === 0) {

        alert(
            "Cart is empty."
        );

        return;

    }


    let total = 0;


    cart.forEach(item => {

        total +=
            item.price *
            item.quantity;

    });


    const bill = {

        number:
            document.getElementById(
                "billNumber"
            ).textContent,

        date:
            new Date()
                .toLocaleString("en-IN"),

        payment:
            document.getElementById(
                "paymentMethod"
            ).value,

        items:
            [...cart],

        total:
            total

    };


    createReceipt(bill);


    window.print();

}



/* =========================================
   CREATE RECEIPT
   ========================================= */

function createReceipt(bill) {


    let itemsHTML = "";


    bill.items.forEach(item => {

        itemsHTML += `

            <div class="receipt-line">

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

    });


    document.getElementById(
        "receipt"
    ).innerHTML = `

        <h2>ROYAL STORE</h2>

        <div style="
            text-align:center;
            font-size:11px;
        ">

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


        <div class="receipt-line">

            <b>
                GRAND TOTAL
            </b>

            <b>
                ${money(bill.total)}
            </b>

        </div>


        <hr>


        <p style="
            text-align:center;
            font-size:11px;
        ">

            Thank You!

            <br>

            Visit Royal Store Again

        </p>

    `;

}



/* =========================================
   PRODUCT PAGE
   ========================================= */

function renderProducts() {

    const search =
        (
            document.getElementById(
                "productFilter"
            ).value || ""
        ).toLowerCase();


    const filtered =
        products.filter(product =>

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

        filtered.map(product => {

            let status =
                "Available";

            let css =
                "available";


            if (product.stock === 0) {

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
                        ${money(product.price)}
                    </td>

                    <td>
                        ${product.stock}
                    </td>

                    <td>
                        ${product.alert}
                    </td>

                    <td>

                        <span
                            class="status ${css}">

                            ${status}

                        </span>

                    </td>

                    <td>

                        <button
                            class="btn green small"
                            onclick="
                                restock(
                                    ${product.id}
                                )
                            ">

                            + Stock

                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}



/* =========================================
   STOCK PAGE
   ========================================= */

function renderStock() {

    const table =
        document.getElementById(
            "stockTable"
        );


    const warning =
        document.getElementById(
            "stockWarning"
        );


    const low =
        products.filter(
            p => p.stock <= p.alert
        );


    if (low.length > 0) {

        warning.innerHTML = `

            <div class="warning-box">

                ⚠ <b>Low Stock:</b>

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

        products.map(product => {

            const used =
                product.original -
                product.stock;


            const percentage =
                product.original > 0

                ? Math.round(
                    (
                        used /
                        product.original
                    ) * 100
                )

                : 0;


            let status =
                "Available";

            let css =
                "available";


            if (product.stock === 0) {

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
                            class="status ${css}">

                            ${status}

                        </span>

                    </td>

                    <td>

                        <button
                            class="btn green small"
                            onclick="
                                restock(
                                    ${product.id}
                                )
                            ">

                            + Stock

                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}



/* =========================================
   RESTOCK
   ========================================= */

function restock(id) {

    const product =
        products.find(
            p => p.id === id
        );


    const amount =
        Number(
            prompt(
                "How many stock to add?",
                10
            )
        );


    if (
        amount &&
        amount > 0
    ) {

        product.stock +=
            amount;

        product.original +=
            amount;


        saveData();


        renderProducts();

        renderStock();

        updateQuickInfo();

    }

}



/* =========================================
   ADD PRODUCT MODAL
   ========================================= */

function openProductModal() {

    document
        .getElementById(
            "productModal"
        )
        .classList
        .remove("hidden");

}


function closeProductModal() {

    document
        .getElementById(
            "productModal"
        )
        .classList
        .add("hidden");

}



/* =========================================
   SAVE PRODUCT
   ========================================= */

function saveProduct() {


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
        stock < 0
    ) {

        alert(
            "Please enter valid product details."
        );

        return;

    }


    products.push({

        id:
            Date.now(),

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
            alertLevel

    });


    saveData();


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

}



/* =========================================
   BILL LIST
   ========================================= */

function renderBills() {

    const table =
        document.getElementById(
            "billTable"
        );


    if (bills.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="6"
                    class="empty">

                    No bills available.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =

        bills
            .slice()
            .reverse()
            .map(bill => {

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
                            ${bill.items.length}
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
                                class="btn blue small"
                                onclick='
                                    printSavedBill(
                                        ${JSON.stringify(bill)}
                                    )
                                '>

                                Print

                            </button>

                        </td>

                    </tr>

                `;

            })
            .join("");

}



/* =========================================
   PRINT SAVED BILL
   ========================================= */

function printSavedBill(bill) {

    createReceipt(bill);

    window.print();

}



/* =========================================
   QUICK INFO
   ========================================= */

function updateQuickInfo() {

    document.getElementById(
        "productCount"
    ).textContent =
        products.length;


    document.getElementById(
        "quickLowStock"
    ).textContent =

        products.filter(
            p => p.stock <= p.alert
        ).length;


    document.getElementById(
        "lowStockCount"
    ).textContent =

        products.filter(
            p => p.stock <= p.alert
        ).length;

}



/* =========================================
   PRODUCT SEARCH FILTER
   ========================================= */

document
    .getElementById(
        "productFilter"
    )
    .addEventListener(
        "input",
        renderProducts
    );



/* =========================================
   DATE
   ========================================= */

document.getElementById(
    "currentDate"
).textContent =

    new Date().toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );



/* =========================================
   INITIAL LOAD
   ========================================= */

updateQuickInfo();

renderCart();

renderProducts();

renderStock();

renderBills();

generateNextBillNumber();
