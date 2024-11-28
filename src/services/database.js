require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { nftcontract } = require("../config/config");
const { parseNftType, generateNftType } = require("../utils/helpers");
//const portalABI = require("../utils/portalABI.json");
const { ethers } = require("ethers");
const pool = require("./pool");
const CryptoJS = require("crypto-js");
const { Wallet } = require("ethers");
const fs = require("fs");
const csv = require("csv-parser");

function logToFile(message) {
    const logMessage = `[${new Date().toISOString()}] ${message}\n`;
    const serverpath = process.env.SERVERPATH;
    fs.appendFileSync(serverpath, logMessage);
}

if (!ethers.providers) {
    console.error("Failed to load ethers providers.");
} else {
    logToFile("Ethers providers loaded successfully.");
}

//const provider = new ethers.providers.JsonRpcProvider(process.env.RPC);
//const contract = new ethers.Contract(nftcontract, portalABI, provider);
//const privateKey = process.env.PRIVATE_KEY;
//const signer = new Wallet(privateKey, provider);

async function getNonce() {
    // Fetch the current nonce for the backend wallet
    return await provider.getTransactionCount(signer.address, "latest");
}

async function getConnection() {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        throw error;
    }
}

/*
    The validateUser function is designed to validate a user's credentials and ensure 
    they are authorized to access the system. This function queries the database to 
    verify the provided user ID and password. It ensures that the user's credentials 
    are correct and that they have the necessary permissions to access the system.
*/
async function validateUser(username, password) {
    try {
        const conn = await getConnection();
        let bytes = CryptoJS.AES.decrypt(username, process.env.SECRET_KEY);
        const decryptedUser = bytes.toString(CryptoJS.enc.Utf8);

        bytes = CryptoJS.AES.decrypt(password, process.env.SECRET_KEY);
        const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

        /*

        General Outline of Steps
        
        Establish Database Connection:
        
            Obtain a connection to the database using getConnection().
        
        Query User Credentials:
        
            Execute an SQL SELECT query to fetch the user's stored password and other relevant 
            details based on the provided user ID.
        
        Validate Password:
        
            Compare the provided password with the stored password to ensure they match.
        
        Check User Status:
        
            Verify that the user's account is active and not locked or disabled.
        
        Release Database Connection:
        
            Ensure the database connection is released after the operation is completed.
        
        Handle Errors:
        
            Catch any errors that occur during the process, log them, and return a failure s
            tatus.

        */
        
        // return { valid: isPasswordValid, userId: user.id };
    } catch (error) {
        logToFile("Database error:", error);
        return { valid: false, error: "Database error" };
    }    

}

/*
    The getUserInventoryFromDB function is designed to retrieve a user's inventory 
    from the database. This function queries the database to fetch all items associated 
    with the given user ID. It ensures that the system can access and return the user's 
    inventory details.
*/
async function getUserInventoryFromDB(levelId, walletAddress) {
    /*

    Establish Database Connection:

        Obtain a connection to the database using getConnection().
    
    Query User Inventory:

        Execute an SQL SELECT query to fetch all items associated with the given user 
        ID from the inventory table.
    
    Process Query Result:

        Process the query result to format the inventory data as needed.
    
    Release Database Connection:

        Ensure the database connection is released after the operation is completed.
    
    Handle Errors:

        Catch any errors that occur during the process, log them, and return a failure 
        status.

    */
}

/*
    The walletConnected function is designed to check if a wallet is currently 
    connected to the system. This function queries the database to determine if 
    there is an active connection for the given wallet address. It ensures that 
    the system can verify the wallet's connection status.
*/
async function walletConnected(walletAddress) {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query(
            "SELECT user_id FROM ndp_users WHERE wallet_address = ?",
            [walletAddress]
        );
        conn.release();
        return rows.length > 0;
    } catch (error) {
        return false;
    }
}

/*
    The userConnected function is designed to check if a user is currently connected 
    to the system. This function queries the database to determine if there is an 
    active session or connection for the given user ID. It ensures that the system 
    can verify the user's connection status.
*/
async function userConnected(userId) {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query(
            "SELECT user_id FROM ndp_web2users WHERE username = ?",
            [userId]
        );
        conn.release();
        return rows.length > 0;
    } catch (error) {
        return false;
    }
}

/*
    The insertOrUpdateWallet function is designed to insert a new wallet into the 
    database or update an existing wallet's information. This function ensures that 
    the wallet's data is correctly stored and updated in the database based on the 
    provided wallet ID and associated data.
*/
async function insertOrUpdateWallet(userId, walletAddress) {
    try {
        const conn = await getConnection();
        const [result] = await conn.query(
            `INSERT INTO ndp_users (user_id, wallet_address)
            VALUES (?, ?)`,
            [userId, walletAddress]
        );
        conn.release();

        return result.insertId;
    } catch (error) {
        console.error("Database error:", error);
        return null;
    }
}

/*
    The insertOrUpdateUser function is designed to insert a new user into the database 
    or update an existing user's information. This function ensures that the user's data 
    is correctly stored and updated in the database based on the provided user ID and 
    username.
*/
async function insertOrUpdateUser(userId, userx) {
    try {
        const conn = await getConnection();
        const [result] = await conn.query(
            `INSERT INTO ndp_web2users (user_id, username)
            VALUES (?, ?)`,
            [userId, userx]
        );
        conn.release();

        return result.insertId;
    } catch (error) {
        console.error("Database error:", error);
        return null;
    }
}

/*
    The logoutUser function is designed to handle the process of logging out a user from the
    system. This function deletes the user's session or related data from the database based 
    on their wallet address. It ensures that the user's session is properly terminated and 
    their data is removed from the active sessions.
*/
async function logoutUser(walletAddress) {
    try {
        const conn = await pool.getConnection();
        const [result] = await conn.query(
            `DELETE FROM ndp_users
            WHERE user_id IN (
                SELECT id FROM users
                WHERE wallet_address = ?
            )`,
            [walletAddress]
        );
        conn.release();

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Database error:", error);
        return false;
    }
}

/*
    The extractItems function is designed to handle the extraction of items from a game entity's
    inventory. This function processes a list of item IDs, retrieves their details from the 
    database, marks them as deleted, and generates NFT types for the extracted items. It ensures 
    that the items are correctly removed from the inventory and their attributes are properly 
    recorded.
*/
async function extractItems(extract, walletAddress) {
    /*

    Check for Items:

        If there are no items to extract, log this information and return early.
    
    Establish Database Connection:

        Obtain a connection to the database using getConnection().
    
    Start Transaction:

        Begin a database transaction to ensure atomicity of the extraction process.
    
    Retrieve Item Details:

        Query the database to retrieve the details of the items to be extracted using their IDs.
    
    Check Retrieved Items:

        If no items are found, rollback the transaction, release the connection, and return early.
    
    Mark Items as Deleted:

        Update the database to mark the retrieved items as deleted by setting a deletion timestamp.
    
    Commit Transaction:

        Commit the transaction to finalize the deletion of the items.
    
    Generate NFT Types:

        Loop through the retrieved items and generate NFT types based on their details.
    
    Handle Errors:

        Catch any errors that occur during the process, log them, rollback the transaction if
        necessary, and rethrow the error.
    
    Release Database Connection:

        Ensure the database connection is released regardless of whether the operation was
        successful or an error occurred.

    */
}

/*
    The injectItems function is designed to inject a list of items into a game entity's inventory. 
    This function processes each item, parses its details, and inserts the relevant data into the 
    database. It ensures that all items are correctly associated with the entity and their 
    attributes are properly recorded.
*/
async function injectItems(levelId, walletAddress, items) {
    /*

    Establish Database Connection:
    
        Obtain a connection to the database using getConnection().
    
    Log Injection Start:
    
        Log the start of the injection process, including the levelId and walletAddress.
    
    Retrieve Entity ID:
    
        Retrieve the entity ID (user/character) associated with the given levelId and walletAddress.
    
    Check for Items:
    
        If there are no items to inject, log this information and return early.
    
    Prepare Values Array:
    
        Initialize an array to hold the values for each item to be inserted into the database.
    
    Process Each Item:
    
        Loop through each item in the items array:
        Log the parsing of the NFT type for the item.
        Parse the item's details using parseNftType().
        Log the parsed item details.
        Prepare the values for the item, replacing nulls with appropriate defaults.
        Add the prepared values to the values array.
    
    Insert Items into Database:
    
        Execute an SQL INSERT query to add the items to the database using the prepared values array.
    
    Handle Errors:
    
        Catch any errors that occur during the process, log them, and return an error status.
    
    Release Database Connection:
    
        Ensure the database connection is released regardless of whether the operation was successful
        or an error occurred.

    */
}

/*
    The createPaymentLog function is designed to log a user's transaction details into the database. 
    This function records various aspects of a payment or transaction, such as the user ID, transaction
    amount, transaction type, and timestamp. It ensures that all relevant transaction data is stored 
    for future reference and auditing.
 */
async function createPaymentLog(logData) {
    /*
    
    Establish Database Connection:

        Obtain a connection to the database using getConnection().
    
    Prepare Log Data:

        Extract and prepare the necessary data from the logData parameter to be inserted into the
        database.
    
    Insert Log Entry:

        Execute an SQL INSERT query to add a new record into the user_payment_log table with the prepared
        log data.
    
    Handle Errors:

        Catch any errors that occur during the process, log them, and rethrow the error.
    
    Release Database Connection:

        Ensure the database connection is released regardless of whether the operation was successful
        or an error occurred.

    */
}

/*
    The earnPackage function is designed to handle the process of awarding a package to a game entity, such
    as a game character. This function updates the entity's attributes such as credits, action points, 
    package duration, inventory size, etc. It also inserts relevant records into the database to reflect the
    awarded package and its associated items.
 */
async function earnPackage(price, robotId) {
    /*

    Establish Database Connection:

        Obtain a connection to the database using getConnection().
    
    Fetch Current Entity Details:

        Query the database to retrieve the current details (credits, action points, package duration, 
        inventory size) of the entity (character) using its ID.
    
    Check Entity Existence:

        Verify if the entity exists in the database. If not, throw an error.
        
    Update Entity Attributes:

        Calculate the updated values for credits, action points, package duration, and inventory size.
        Update the entity's record in the database with these new values.
    
    Insert Consumable Items:

        Insert records into the appropriate table to reflect the consumable items awarded as part of 
        the package.
    
    Insert Premium Information:

        Insert a record into the appropriate table to log the premium package details, including timestamps 
        and package-specific flags.

    Handle Errors:

        Catch any errors that occur during the process, log them, and rethrow the error.
    
    Release Database Connection:

        Ensure the database connection is released regardless of whether the operation was successful or 
        an error occurred.    

    */
}

/*
* The setItemsDeleted function is designed to mark specific items as deleted in the database. 
This function updates the deleted status of items based on their IDs. It ensures that the items 
are correctly marked as deleted and no longer considered active in the system.
* @param {Array} items - An array of item IDs to set as deleted.
* @returns {Promise} A promise that resolves to the number of items affected.
*/
async function setItemsDeleted(items, isDeleted) {
    /*
    Establish Database Connection:

        Obtain a connection to the database using getConnection().
    
    Prepare Placeholders and Values:

        Prepare the placeholders and values for the SQL query based on the provided item IDs.
    
    Execute Update Query:

        Execute an SQL UPDATE query to set the deleted status of the specified items.
    
    Check Update Result:

        Check the result of the update query to determine if the items were successfully 
        marked as deleted.
    
    Release Database Connection:

        Ensure the database connection is released after the operation is completed.
    
    Handle Errors:

        Catch any errors that occur during the process, log them, and return a failure status.

    */
    
}

module.exports = {
    getConnection,
    validateUser,
    getUserInventoryFromDB,
    walletConnected,
    insertOrUpdateWallet,
    extractItems,
    injectItems,
    logoutUser,
    userConnected,
    insertOrUpdateUser,
    createPaymentLog,
    earnPackage,
    setItemsDeleted
};
