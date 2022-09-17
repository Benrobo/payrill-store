function setTextAnimation(delay, duration, strokeWidth, timingFunction, strokeColor, repeat) {
    let paths = document.querySelectorAll("path");
    let mode = repeat ? 'infinite' : 'forwards'
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const length = path.getTotalLength();
        path.style["stroke-dashoffset"] = `${length}px`;
        path.style["stroke-dasharray"] = `${length}px`;
        path.style["stroke-width"] = `${strokeWidth}px`;
        path.style["stroke"] = `${strokeColor}`;
        path.style["animation"] = `${duration}s svg-text-anim ${mode} ${timingFunction}`;
        path.style["animation-delay"] = `${i * delay}s`;
    }
}

setTextAnimation(0.1, 1, 3, 'ease', '{{themecolor}}', true);

function ajax(type, url, payload) {
    return fetch(api + url, {
        method: type,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
}

function modal(msg, title="Alert") {
    new Attention.Alert({
        title: title,
        content: msg,
        afterClose: ()=>{}
    });
}

const api = "http://192.168.100.74:8080"; //"http://localhost:8080";
const storeId = "{{id}}";
const storeLogo = "{{logo}}";
const storeName = "{{name}}";

//Create DB for storing cart items

let db = new NOdb({
    database: "EcartDB",
    path: "./EcartDB.nodb",
    encrypt: false,
});

//Create Tables
db.query("CREATE TABLE ecart(ecartId,name,paid,active)");

db.query("SELECT * FROM ecart");
if (db.length == 0) {
    createFirstCart();
}

async function createFirstCart() {
    let result = await ajax("POST", "/api/ecart/create", {
        name: "First " + storeName + " Ecart"
    })
    let json = await result.json();
    db.query(`INSERT INTO ecart VALUES('${json.data.ecart}','${json.data.name}',false,true)`)
}

async function addToCart(id) {
    let elem = document.getElementById(id);
    elem.innerHTML = `<i class="fa fa-spinner fa-spin"></i> Adding To Ecart`;
    let cartId = await getActiveEcart();
    try {
        let result = await ajax("POST", "/api/ecart/add", {
            itemId: id,
            cartId,
        })
        let json = await result.json();
        if (json.success) {
            elem.innerHTML = `<i class="fa fa-shopping-cart"></i> Remove From Ecart`;
            elem.setAttribute("class", "removeFromCart");
            elem.setAttribute("onclick", `removeFromCart('${id}')`);
        } else {
            elem.innerHTML = `<i class="fa fa-shopping-cart"></i> Add To Ecart`;
            modal(json.message);
        }
    } catch (error) {
        elem.innerHTML = `<i class="fa fa-shopping-cart"></i> Add To Ecart`;
    }
}

async function removeFromCart(id) {
    let elem = document.getElementById(id);
    elem.innerHTML = `<i class="fa fa-spinner fa-spin"></i> Removing From Ecart`;
    let cartId = await getActiveEcart();
    try {
        let result = await ajax("POST", "/api/ecart/remove", {
            itemId: id,
            cartId,
        })
        let json = await result.json();
        if (json.success) {
            elem.innerHTML = `<i class="fa fa-shopping-cart"></i> Add To Ecart`;
            elem.setAttribute("class", "addToCart");
            elem.setAttribute("onclick", `addToCart('${id}')`);
        } else {
            elem.innerHTML = `<i class="fa fa-shopping-cart"></i> Remove From Ecart`;
        }
    } catch (error) {
        elem.innerHTML = `<i class="fa fa-shopping-cart"></i> Remove From Ecart`;
    }
}

async function syncItems(stat) {
    showSync();
    let cartId = await getActiveEcart();
    try {
        let result = await ajax("GET", "/api/ecart/get/" + cartId)
        let json = await result.json();
        if (json.success) {
            if (!stat) {
                await getStoreItems();
            }
            let items = json.data.items;
            items.forEach(function(item) {
                let elem = document.getElementById(item.item_id);
                if (elem && elem.getAttribute("class") != "removeFromCart") {
                    elem.innerHTML = `<i class="fa fa-shopping-cart"></i> Remove From Ecart`;
                    elem.setAttribute("class", "removeFromCart");
                    elem.setAttribute("onclick", `removeFromCart('${item.item_id}')`);
                }
            })
        }
        hideSync();
    } catch (error) {
        hideSync();
    }
}

async function getActiveEcart() {
    db.query("SELECT * FROM ecart");
    let active = null;
    db.result.active.forEach(function(each, i) {
        if (each == true) {
            active = db.result.ecartId[i];
        }
    })
    if (!active) {
        await createFirstCart();
        return await getActiveEcart();
    } else {
        return active;
    }
}

function stopLoader() {
    const loader = document.getElementById("loader");
    setTimeout(function() {
        loader.setAttribute("class", "fade");
        setTimeout(function() {
            loader.style.display = "none";
        }, 2000)
    }, 1000)
}

function showSync() {
    try {
        document.getElementById("sync").style.display = "block";
    } catch (e) {
    }
}

function hideSync() {
    try {
        document.getElementById("sync").style.display = "none";
    } catch (e) {
    }
}

async function getStoreItems() {
    try {
        let result = await ajax("POST", "/api/item/get/all", {
            storeId
        })
        let response = await result.json();

        // Stop Loading Animation
        try {
            stopLoader();
        } catch (error) {}

        let items = response.data;

        let products = document.getElementById("products");
        products.innerHTML = "";

        items.forEach(function(item) {
            let image = item.item_image;
            if (image.trim() == "") {
                image = storeLogo;
            }
            let template = `<div class="product">
                    <img src="${image}">
                    <div class="product-info">
                        <div class="subinfo">
                            <font>
                                <p>${item.item_name}</p>
                            </font>
                            <font class="price">
                                <i class="currency">${currencyToSymbol(item.item_currency)}</i>
                                <p>${item.item_price}</p>
                            </font>
                        </div>
                        <div class="product-detail">
                            ${item.item_description}
                        </div>
                        <button id="${item.id}" class="addToCart" onclick="addToCart('${item.id}')"><i class="fa fa-shopping-cart"></i> Add To Ecart</button>
                    </div>
                </div>`;
            products.innerHTML += template;
        })

        if (items.length == 0) {
            products.innerHTML = `<div class="no_item">No Item in Store</div>`;
            try {
                document.getElementById("sync").remove()
            } catch (error) {
                
            }
        }
        document.getElementById("item_count").innerHTML = items.length;
    } catch (error) {
        document.location.href = document.location.href;
    }
}

// Load Store Items
syncItems();

async function searchStoreItem(name) {
    if (name.trim() === "") {
        return getStoreItems();
    }
    try {
        let result = await ajax("POST", "/api/item/get/all", {
            storeId,
            name,
        })
        let response = await result.json();

        // Stop Loading Animation
        stopLoader();

        let items = response.data;
        console.log(items)

        let products = document.getElementById("products");
        products.innerHTML = "";

        items.forEach(function(item) {
            let image = item.item_image;
            if (image.trim() == "") {
                image = storeLogo;
            }
            let template = `<div class="product">
                    <img src="${image}">
                    <div class="product-info">
                        <div class="subinfo">
                            <font>
                                <p>${item.item_name}</p>
                            </font>
                            <font class="price">
                                <i class="currency">${currencyToSymbol(item.item_currency)}</i>
                                <p>${item.item_price}</p>
                            </font>
                        </div>
                        <div class="product-detail">
                            ${item.item_description}
                        </div>
                        <button id="${item.id}" class="addToCart" onclick="addToCart('${item.id}')"><i class="fa fa-shopping-cart"></i> Add To Ecart</button>
                    </div>
                </div>`;
            products.innerHTML += template;
        })

        if (items.length == 0) {
            products.innerHTML = `<div class="no_item">No Result Found For Item <b>${name}</b></div>`;
        }
        syncItems(true);
    } catch (error) {
        document.location.href = document.location.href;
    }
}

const search = document.getElementById("search");
search.oninput = function() {
    searchStoreItem(search.value);
}

function hideSyncer() {
    document.getElementById("sync").remove()
}

let SYNCDATA = JSON.stringify(db.getDB());

function syncDetector() {
    let DATA = JSON.stringify(db.getDB());
    if(DATA != SYNCDATA){
        syncItems();
        SYNCDATA = DATA;
        console.log("Syncing...")
    }
}

function currencyToSymbol(currency) {
    let all = {
        "USD": "$",
        "CAD": "$",
        "GBP": "£",
        "JPY": "¥",
        "EUR": "€"
    }
    return all[currency] || currency;
}

setInterval(async function() {
    syncDetector();
}, 1000);