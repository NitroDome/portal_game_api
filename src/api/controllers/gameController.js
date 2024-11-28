const {
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
    setItemsDeleted,
} = require("../../services/database");
const fs = require("fs");

const { parseNftType } = require("../../utils/helpers");

const metadataURL = process.env.METADATA_URL;
const contractId = 0; // contractId from portal admin db; request from NitroDome

/**
 * Logs a message to a file with a timestamp.
 * @param {string} message - The message to log.
 */
function logToFile(message) {
    const logMessage = `[${new Date().toISOString()}] ${message}\n`;
    const serverpath = process.env.SERVERPATH;
    fs.appendFileSync(serverpath, logMessage);
}

/**
 * The assignWalletToUser function is designed to assign a wallet address to a
 * user in the system. This function ensures that the user's wallet address is
 * correctly stored and updated in the database based on the provided user ID
 * and wallet address.
 * @param {Request} req - The request object. Expects walletAddress in the URL
 * and username, password in the body.
 * @param {Response} res - The response object. Returns success status.
 */
exports.assignWalletToUser = async (req, res) => {
    const { walletAddress } = req.params;
    const { username, password } = req.body;

    try {
        const { valid, userId: gameUserId } = await validateUser(
            username,
            password
        );

        if (!valid) {
            return res.status(401).json({
                success: false,
                error: "Invalid username or password",
            });
        }

        const wConnected = await walletConnected(walletAddress);

        if (wConnected) {
            return res.status(409).json({
                success: false,
                error: "Wallet address already connected to another user",
            });
        }

        const result = await insertOrUpdateWallet(gameUserId, walletAddress);

        if (!result) {
            return res.status(500).json({
                success: false,
                error: "Failed to assign wallet to user",
            });
        }

        res.json({
            success: true,
            message: result.insertId
                ? "Wallet address assigned to new user."
                : "Wallet address updated.",
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to assign wallet to user",
        });
    }
};

/**
 * The assignNDUserToUser function is designed to assign a new or existing ND user ID
 * to a user in the system. This function ensures that the user's ND user ID is correctly
 * stored and updated in the database based on the provided user ID and ND user ID.
 *
 * @param {Request} req - The request object. Expects ndUserId in the URL and username,
 * password in the body.
 * @param {Response} res - The response object. Returns success status.
 */
exports.assignNDUserToUser = async (req, res) => {
    const { ndUserId } = req.params;
    const { username, password } = req.body;

    try {
        const { valid, userId: gameUserId } = await validateUser(
            username,
            password
        );

        if (!valid) {
            return res.status(401).json({
                success: false,
                error: "Invalid username or password",
            });
        }

        const wConnected = await userConnected(ndUserId);

        if (wConnected) {
            return res.status(409).json({
                success: false,
                error: "ndUserId already connected to another user",
            });
        }

        const result = await insertOrUpdateUser(gameUserId, ndUserId);

        if (!result) {
            return res.status(500).json({
                success: false,
                error: "Failed to assign ndUserId to user",
            });
        }

        res.json({
            success: true,
            message: result.insertId
                ? "ndUserId assigned to new user."
                : "ndUserId updated.",
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to assign ndUserId to user",
        });
    }
};

/**
 * The buypack function handles the purchase of a game pack by a user. This function processes
 * the request to buy a specific package, logs the transaction, updates the user's inventory,
 * and applies any relevant bonuses or special conditions.
 *
 * @param {Request} req - The request object, includes levelId, userId, and packageId in the URL.
 * @param {Response} res - The response object, returns whether the transaction was completed.
 */
exports.buypack = async (req, res) => {
    const { levelId, ndUserId, packageId } = req.params;

    try {
        /*
        
        Determine Package Details:

            Based on the packageId, determine the event type, amount, and any special conditions 
            associated with the package.
        
        Validate Package ID:

            If the packageId is invalid, return a 400 status with an error message.
        
        Retrieve Entity ID:

            Retrieve the entity ID (user/character) associated with the given levelId and 
            ndUserId.
        
        Prepare Log Data:

            Prepare the log data for the transaction, including user ID, transaction ID, entity ID, 
            timestamp, method, amount, special conditions, price, currency, provider, item code, 
            and other relevant details.
        
        Log the Transaction:

            Call createPaymentLog to log the transaction in the database.
        
        Retrieve Entity Details:

            Retrieve the entity details using the entity ID.
        
        Apply Bonuses:

            Check if the user is eligible for any bonuses (e.g., first buy bonus) and apply 
            them if applicable.
        
        Update Inventory:

            Update the user's inventory with the purchased package.
        
        Send Response:

            Send a response indicating whether the transaction was completed successfully.
        
        */

        res.json({
            success: true,
            message: "Transaction finalized successfully",
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to finalize transaction",
        });
    }
};

/**
 * The cancelPortalTransaction function is designed to handle the cancellation of a portal
 * transaction. This function updates the transaction status in the database to reflect that
 * it has been canceled. It ensures that the transaction is correctly marked as canceled
 * and any necessary cleanup or rollback actions are performed
 *
 * @param {Request} req - The request object, includes levelId in the URL and transaction
 * details in the body.
 * @param {Response} res - The response object, returns whether the transaction was canceled.
 */
exports.cancelPortalTransaction = async (req, res) => {
    const extract = req.body;

    try {
        /*

        extract: array of item IDs to be canceled

        Mark Items as Deleted:
        
            Call the setItemsDeleted function to update the status of the specified items 
            in the database.

        Send Response:
        
            Send a response indicating whether the transaction was canceled successfully.

        */

        res.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to cancel transaction",
        });
    }
};

/**
 * The finalizePortalTransaction function is designed to finalize a portal transaction
 * after confirmation on the blockchain. This function processes the extraction and injection
 * of items for a user, ensuring that the transaction is completed successfully.
 *
 * @param {Request} req - The request object, includes levelId and walletAddress in the URL
 * and transaction details in the body.
 * @param {Response} res - The response object, returns whether the transaction was completed.
 */
exports.finalizePortalTransaction = async (req, res) => {
    const { levelId, walletAddress } = req.params;
    const { extract, inject } = req.body;

    const result = { extract: "false", inject: "false" };

    try {
        /*

        Extract Items:

            Call the extractItems function to handle the extraction of items from the 
            user's inventory.

            result.extract = await extractItems(walletAddress, extract);
        
        Inject Items:
        
            Call the injectItems function to handle the injection of new items into the 
            user's inventory.

            result.inject = await injectItems(walletAddress, inject);
        
        Determine Success:
        
            Check if both the extraction and injection operations were successful.

            const success = result.extract && result.inject;
        
        Send Response:
        
            Send a response indicating whether the transaction was finalized successfully.

        */

        res.json({ success, finalized: success, ...result });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to finalize transaction",
        });
    }
};

/**
 * The getNFTMap function is designed to retrieve a mapping of NFTs (Non-Fungible Tokens)
 * for a user. This function processes the provided NFT details, parses the NFT types,
 * and returns an array of allowed NFTs with their corresponding details.
 *
 * @param {Request} req - The request object, includes levelId in the URL, and expected
 * NFT details in the body.
 * @param {Response} res - The response object, returns an array of allowed NFTs.
 */
exports.getNFTMap = async (req, res) => {
    const { levelId } = req.params;
    const nftDetails = req.body; // Array of { contractId, tokenId, quantity, nftType }

    try {
        /*

        nftDetails: array of NFT details
            [
                { contractId, tokenId, quantity, nftType }, 
            ]

        Process Each NFT Detail:

        Loop through each NFT detail in nftDetails:

            Parse the NFT type using parseNftType.
            Construct an object with the parsed details and additional information.
        
        Send Response:

            Send a response with the array of allowed NFTs.

            response: array of allowed NFTs
                [
                    {
                        gameLevel,
                        itemId,
                        name,
                        description,
                        nftType,
                        quantity,
                        quantityPerNft,
                        tokenId.
                        uri,
                        image,
                        contractId,
                    },
                ]
        
        */

        res.json(allowedNFTs);
    } catch (error) {
        console.error("Error processing NFT details:", error);
        res.status(500).json({ error: "Failed to process NFT details" });
    }
};

/**
 * The getUserInventory function is designed to retrieve the user's inventory for a
 * specific game level. This function queries the database to fetch all inventory items
 * associated with the given level ID and wallet address. It ensures that the system can
 * access and return the user's inventory details.
 *
 * @param {Request} req - The request object, includes levelId and walletAddress in the URL.
 * @param {Response} res - The response object, returning the user's inventory items.
 */
exports.getUserInventory = async (req, res) => {
    const { levelId, walletAddress } = req.params;
    logToFile(
        `Received request for levelId: ${levelId}, walletAddress: ${walletAddress}`
    );

    try {
        /*
            Retrieve User Inventory:

                Call the getUserInventoryFromDB function to fetch the user's inventory
                from the database.
        
            Send Response:

                Send a response with the retrieved inventory items.

                response: array of inventory items
                    [
                        {
                            gameLevel,
                            itemId,
                            name,
                            description,
                            nftType,
                            quantity,
                            quantityPerNft,
                            uri,
                            image,
                            contractId,
                            canExtract,
                        },
                    ]

        */

        res.json(items);
    } catch (error) {
        logToFile(`Error occurred: ${error.message}`);
        res.status(500).json({
            message: "Failed to retrieve user inventory.",
            error: error.message,
        });
    }
};

/**
 * The isWalletConnected function is designed to check if a wallet is currently
 * connected to the system. This function queries the database to determine if there
 * is an active connection for the given wallet address. It ensures that the system
 * can verify the wallet's connection status.
 *
 * @param {Request} req - The request object. Expects walletAddress in the URL.
 * @param {Response} res - The response object. Returns connection status.
 */
exports.isWalletConnected = async (req, res) => {
    const { walletAddress } = req.params;
    res.json({ connected: await walletConnected(walletAddress) });
};

/**
 * The isUserConnected function is designed to check if a user is currently connected
 * to the system. This function queries the database to determine if there is an
 * active session or connection for the given user ID. It ensures that the system can
 * verify the user's connection status.
 *
 * @param {Request} req - The request object. Expects ndUserId in the URL.
 * @param {Response} res - The response object. Returns connection status.
 */
exports.isUserConnected = async (req, res) => {
    const { ndUserId } = req.params;
    res.json({ connected: await userConnected(ndUserId) });
};

/**
 * The logoutUser function is designed to handle the process of logging out a user from
 * the system. This function deletes the user's session or related data from the database
 * based on their user ID. It ensures that the user's session is properly terminated and
 * their data is removed from the active sessions.
 *
 * @param {Request} req - The request object, includes walletAddress in the body.
 * @param {Response} res - The response object, returns whether the transaction was completed.
 */
exports.logoutUser = async (req, res) => {
    const { walletAddress } = req.body;

    try {
        const result = await logoutUser(walletAddress);

        if (!result) {
            return res.status(500).json({
                success: false,
                error: "Failed to logout user",
            });
        }

        res.json({
            success: true,
            message: "User logged out.",
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to logout user",
        });
    }
};

/**
 * The submitPortalTransaction function is designed to handle the submission of a portal
 * transaction. This function processes the transaction details, logs the transaction,
 * and updates the user's inventory accordingly. It ensures that the transaction is
 * correctly recorded and the user's inventory is updated.
 *
 * @param {Request} req - The request object, includes levelId and walletAddress in the
 * URL and extract details in the body.
 * @param {Response} res - The response object, returns whether the extractable items are confirmed.
 */
exports.submitPortalTransaction = async (req, res) => {
    const { levelId, walletAddress } = req.params;
    const extract = req.body;

    try {
        logToFile(
            `Submitting portal transaction for ${walletAddress} on level ${levelId}`,
            extract
        );

        // confirm the extract items are available in the user's inventory
        const userInventoryFromDB = await getUserInventoryFromDB(walletAddress);

        const missingItems = extract.filter(
            (itemId) => !userInventoryFromDB.some((item) => item.Id === itemId)
        );

        if (missingItems.length > 0) {
            return res.status(404).json({
                success: false,
                error: "Items not found in user's inventory",
                missingItems,
            });
        }

        // set the items as deleted = true in the database
        await setItemsDeleted(extract, true);

        res.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to confirm extractable items",
        });
    }
};
