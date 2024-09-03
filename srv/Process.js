const { array } = require('@sap/cds');
const hanaClient = require('@sap/hana-client');
const { INSPECT_MAX_BYTES } = require('buffer');
const { time, Console } = require('console');
const e = require('express');
const { queryObjects } = require('v8');

class Process extends cds.ApplicationService {
    async init() {

        //PRODUCTS
        this.before("UPDATE", "Products", (req) => editProducts(req));
        // this.after("UPDATE", "Products", (req) => readProducts());

        this.before("DELETE", "Products", (req) => deleteProducts(req));
        // this.after("DELETE", "Products", (req) => readProducts());

        this.before("POST", "Products", (req) => createProduct(req));
        // this.after("POST", "Products", (req) => readProducts());

        this.before("READ", "Products", (req) => readProducts());

        readProducts();

        //BUYS

        this.before("POST", "Buys", (req) => createBuys(req));
        // this.after("POST", "Buys", (req) => readBuys());

        this.before("READ", "Buys", (req) => readBuys(req));

        // readBuys(req);

        return super.init()
    }
}

function getConnectionOptions() {
    return {
        serverNode: '67193050-b34f-45d3-aece-e9b8e40ba853.hana.trial-us10.hanacloud.ondemand.com:443', // Cambia por el host y puerto adecuados
        encrypt: 'true',
        validateCertificate: 'false',
        uid: 'DBADMIN', // Cambia por tu usuario
        pwd: 'ADMINISTRADORbasededatos1' // Cambia por tu contraseña
    };
}

function handleConnectionError(error) {
    if (error) {
        console.error('Connection Failed:', error);
        return;
    }
}

function handleExecError(connection, error) {
    if (error) {
        console.error('Query failed!', error);
        connection.disconnect();
        return;
    }
}

async function printProducts(result) {
    let products = [];


    result.forEach(product => {
        let item = {};
        item["ID"] = product.PR_ID;
        item["name"] = product.NAME;
        item["descr"] = product.DESCR;
        item["price"] = product.PRICE;
        item["UM"] = product.UM;
        item["stock"] = product.STOCK;
        item["buyid"] = product.PR_ID;
        products.push(item);
        // console.log(`${id} - ${name} - ${description} - ${price} - ${unitMeasure}`);
    });
    console.log("Antes delete")
    await DELETE.from("com.shop.product")
    console.log("Despues delete")
    await INSERT.into("com.shop.product").entries(products)
    console.log("Despues insert")
}

async function readProducts() {
return new Promise((resolve)=>{
    const connection = hanaClient.createConnection();

    connection.connect(getConnectionOptions(), (err) => {
        handleConnectionError(err);

        console.log('Connection to HANA successful!');

        const sql = 'SELECT * FROM DBADMIN.ZPRODUCTS';

        connection.exec(sql, (err, result) => {
            handleExecError(connection, err)
            printProducts(result)
            connection.disconnect();
        });
    });

    resolve()
})

}

function readProduct(PR_ID) {
    return new Promise((resolve) => {
        const connection = hanaClient.createConnection();

        connection.connect(getConnectionOptions(), (err) => {
            handleConnectionError(err);

            console.log('Connection to HANA successful!');

            const sql = `SELECT * FROM DBADMIN.ZPRODUCTS WHERE PR_ID = '${PR_ID}';`;
            console.log(sql)

            connection.exec(sql, (err, result) => {
                handleExecError(connection, err)
                resolve(result)
                connection.disconnect();
            });
        });
    })
}

function createProduct(req) {

    executeSQLStatement(`INSERT INTO DBADMIN.ZPRODUCTS VALUES('${req.data["ID"]}', '${req.data["name"]}', '${req.data["descr"]}', ${req.data["price"]}, '${req.data["UM"]}', 0)`)

}

function editProducts(req) {

    executeSQLStatement(`UPDATE ZPRODUCTS SET NAME = '${req.data["name"]}', DESCR = '${req.data["descr"]}', PRICE = ${req.data["price"]}, UM = '${req.data["UM"]}', STOCK = ${req.data["stock"]} WHERE PR_ID = '${req.data["ID"]}';`)

}

async function deleteProducts(req) {
    // console.log("BORRANDOOOO",req.data);

    await executeSQLStatement(`DELETE FROM ZB_P WHERE PR_ID = '${req.data["ID"]}';`);
    await executeSQLStatement(`DELETE FROM ZPRODUCTS WHERE PR_ID = '${req.data["ID"]}';`);

}

async function printBuys(result) {
    return new Promise(async (resolve) => {
        let buys = [];

        result.forEach(async buy => {
            let item = {};
            item["ID"] = buy.ID;
            item["date"] = buy.DATE;
            item["total_price"] = buy.TOTAL_PRICE;
            item["products"] = [{ "Nada1": 1 }, { "Nada2": 2 }]
            // item["products"] = await obtainItems(buy.ID)
            buys.push(item);
        });
        console.log(buys)
        await DELETE.from("com.shop.buys")
        await INSERT.into("com.shop.buys").entries(buys)

        resolve()

    })
}

async function readBuys(req) {
    return new Promise(async (resolve)=>{
        if (req.data["ID"] !== undefined) {
                let items = []
    
                items = await obtainItems(req.data["ID"]);
                console.log("ITEMS", items)
    
                await UPDATE('com.shop.buys', req.data["ID"]).with({ products: items })
    
                let q1 = SELECT.from('com.shop.buys').where({ ID: req.data["ID"] })
                let entradas = await cds.db.run(q1)
        } else {
                const connection = hanaClient.createConnection();
    
                connection.connect(getConnectionOptions(), (err) => {
                    handleConnectionError(err);
    
                    const sql = 'SELECT * FROM DBADMIN.ZBUYS';
    
                    connection.exec(sql, async (err, result) => {
                        handleExecError(connection, err)
                        await printBuys(result)
                        connection.disconnect();
                    });
                });
        }
        resolve()
    })
}

async function obtainItems(buyID) {
    return new Promise(async (resolve) => {
        let products = [];
        let items = await executeSQLStatement(`SELECT * FROM DBADMIN.ZB_P WHERE B_ID = '${buyID}'`);
        items.forEach(item => {
            let product = {}
            product["UUID"] = item.ID;
            product["ID"] = item.PR_ID;
            product["quant"] = item.QUANT;
            products.push(product);
        });
        console.log("PRODUCTSSSSSSSSSSSSSSS", products);
        resolve(products);
        // console.log("despues resolve products")
    })
}

async function createBuys(req) {
    // console.log("POST de compras", req.data)

    let currentDate = new Date().toJSON().slice(0, 10);

    await executeSQLStatement(`INSERT INTO DBADMIN.ZBUYS VALUES('${req.data["ID"]}', '${currentDate}', 1)`)

    req.data["products"].forEach(async products => {
        // const stock = executeSQLStatement(`SELECT STOCK FROM DBADMIN.ZPRODUCTS WHERE PR_ID = '${products.ID}'`)
        // console.log('OBTENER STOCK ',stock)
        // const sql2 = `UPDATE ZPRODUCTS SET STOCK = ${stock + products.quant} WHERE PR_ID = '${products.ID}';`

        executeSQLStatement(`INSERT INTO DBADMIN.ZB_P VALUES('${products.UUID}', '${products.ID}', '${req.data["ID"]}', ${products.quant})`);

        let result = await readProduct(products.ID);
        let stock = 0

        result.forEach(product => {
            stock = product.STOCK;
        });

        executeSQLStatement(`UPDATE ZPRODUCTS SET STOCK = ${stock + products.quant} WHERE PR_ID = '${products.ID}';`)
        // executeSQLStatement(sql2)
    })



}

function executeSQLStatement(Statement) {
    return new Promise((resolve) => {
        const connection = hanaClient.createConnection();
        const sql = Statement;
        connection.connect(getConnectionOptions(), (err) => {
            handleConnectionError(err);

            console.log(sql)

            // console.log('Connection to HANA successful!');

            connection.exec(sql, (err, result) => {
                handleExecError(connection, err)
                // printProducts(result)
                // console.log("Succesfully inserted")
                // console.log(result)
                connection.disconnect();
                resolve(result);
            });
        });
    })
}

module.exports = { Process }