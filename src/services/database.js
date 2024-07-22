require("dotenv").config();
const portalABI = require("../utils/portalABI.json");
const { ethers } = require("ethers");
const pool = require("./pool");
const CryptoJS = require("crypto-js");
const { Wallet } = require("ethers");

if (!ethers.providers) {
    console.error("Failed to load ethers providers.");
} else {
    console.log("Ethers providers loaded successfully.");
}

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const contract = new ethers.Contract(nftcontract, portalABI, provider);

async function getConnection() {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        throw error;
    }
}

async function validateUser(username, password) {
    try {
        const conn = await getConnection();
        const bytes1 = CryptoJS.AES.decrypt(username, process.env.SECRET_KEY);
        const decryptedUser = bytes1.toString(CryptoJS.enc.Utf8);

        const [rows] = await conn.query(
            "SELECT id, password, salt FROM users WHERE username = ?",
            [decryptedUser]
        );

        console.log(rows)
        conn.release();

        if (rows.length === 0) {
            return { valid: false, error: "Username not found" };
        }

        const user = rows[0];

        const bytes = CryptoJS.AES.decrypt(password, process.env.SECRET_KEY);
        const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

        const saltedPassword = user.salt + decryptedPassword;

        const finalHashedPassword = CryptoJS.SHA256(saltedPassword).toString(CryptoJS.enc.Hex);

        const validPassword = finalHashedPassword === user.password;
        return { valid: validPassword, userId: user.id };
    } catch (error) {
        console.log("Database error:", error);
        return { valid: false, error: "Database error" };
    }
}

async function getUserInventoryFromDB(levelId, walletAddress) {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query(
            `SELECT ...
            FROM ...
            WHERE ...`,

            [   // Bind parameters
            ]
        );
        conn.release();

        return rows;
    } catch (error) {
        console.error("Database error:", error);
        return [];
    }
}

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

async function extractItems(extract, walletAddress) {
    if (!extract.length) {
        console.log('No items to extract.');
        return "true";
    }

    let conn; // Declare conn here to make it accessible in the catch and finally blocks

    try {
        conn = await getConnection();
        console.log(`Extracting items for walletAddress: ${walletAddress}`);

        // Start transaction
        await conn.beginTransaction();

        // Pull the items from the items table and lock them for update
        const [rows] = await conn.query(
            `SELECT ...
             FROM items
             WHERE id IN (?)
             AND deleted = 0
             FOR UPDATE`, // Lock the selected rows
            [extract]
        );

        // Get an array of the id from rows
        const ids = rows.map((row) => row.id);
        if (!ids.length) {
            await conn.rollback();
            conn.release();
            return "true"; // or return an appropriate response or error message
        }

        // Update the items to mark them as deleted
        await conn.query(
            `UPDATE items
             SET deleted = UNIX_TIMESTAMP()
             WHERE id IN (?)`,
            [ids]
        );

        // Commit transaction
        await conn.commit();
        conn.release();

        // Loop through items, generate nftType, and send NFTs to the user's wallet
        let nftTypes = [];
        for (let i = 0; i < rows.length; i++) {
            const { slot, item_id, level, level_max } = rows[i];
            //const nftType = await generateNftType(slot, item_id, level, level_max);
            //nftTypes.push(nftType);
        }

        console.log(`Generated NFT types: ${nftTypes}`);

        if (typeof contract.portalTransfer !== 'function') {
            throw new Error("Function portalTransfer not found on contract");
        }


        const privateKey = process.env.PRIVATE_KEY; // Ensure your private key is set in your environment variables
        const signer = new Wallet(privateKey, provider);

        console.log(walletAddress, nftTypes, 'walletAddress, nftTypes')
        // Connect the contract with the signer
        const signedContract = contract.connect(signer);
        let tx = await signedContract.portalTransfer(walletAddress, nftTypes);
        console.log(`Transaction sent: ${tx.hash}`);

        // Wait for the transaction to be mined
        let receipt = await tx.wait();
        console.log(`Transaction mined: ${receipt.transactionHash}`);

        if (receipt.status === 1) {
            console.log('Transaction was successful');
            return "true";
        } else {
            console.log('Transaction failed');
            return "false";
        }
    } catch (error) {
        console.error("Database error during item extraction:", error);

        // Rollback transaction to release the locks in case of error
        if (conn) {
            await conn.rollback();
            console.log('Transaction rolled back, locks released.');
        }
        return "false";
    } finally {
        if (conn) conn.release();
    }
}


async function injectItems(levelId, walletAddress, items) {
    const conn = await getConnection();
    try {
        console.log(`Starting injection process for levelId: ${levelId}, walletAddress: ${walletAddress}`);

        if (!items.length) {
            console.log('No items to inject.');
            return "true";
        }

        // Loop through items and parse nft type
        for (let i = 0; i < items.length; i++) {
            console.log(`Parsing NFT type for item: ${items[i]}`);
        }

        // Insert all rows in a single query
        await conn.query(
            `INSERT INTO items (...)
            VALUES ...`
        );
        console.log('Items successfully inserted into the database.');

        return "true";
    } catch (error) {
        console.error("Database error during item injection:", error);
        return "false";
    } finally {
        conn.release();
    }
}

module.exports = {
    getConnection,
    validateUser,
    getUserInventoryFromDB,
    walletConnected,
    insertOrUpdateWallet,
    logoutUser,
    extractItems,
    injectItems
};
