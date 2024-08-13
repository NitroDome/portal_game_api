const fs = require("fs");
const {
    createPaymentLog,
    earnPackage,
    earnPrice,
    extractItems,
    findRobot,
    getRobotIdbyUser,
    getSeasonInfo,
    getUserInventoryFromDB,
    injectItems,
    insertOrUpdateUser,
    insertOrUpdateWallet,
    logBookentry,
    logCredits,
    logoutUser,
    userConnected,
    validateUser,
    walletConnected,
} = require("../../services/database");
const { getItemNames, parseNftType } = require("../../utils/helpers");

const contractId = 0; // contractId from portal admin db

/**
 * Logs a message to a file with a timestamp.
 * @param {string} message - The message to log.
 */
function logToFile(message) {
    const logMessage = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync("server.log", logMessage);
}

/**
 * Assigns a user's wallet to their game account.
 * @param {Request} req - The request object. Expects walletAddress in the URL and username, password in the body.
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
 * Assigns a user's NitroDome ID to their game account.
 * @param {Request} req - The request object. Expects ndUserId in the URL and username, password in the body.
 * @param {Response} res - The response object. Returns success status.
 */
exports.assignUserToUser = async (req, res) => {
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
 * Handles the purchase of a game pack by a user.
 * @param {Request} req - The request object, includes levelId, userId, and packageId in the URL.
 * @param {Response} res - The response object, returns whether the transaction was completed.
 */
exports.buypack = async (req, res) => {
    const { levelId, ndUserId, packageId } = req.params;

    try {
        let eventType, amount, special;
        switch (packageId) {
            case "1":
                eventType = "RoboManiac - 150 Platinum";
                amount = 150;
                special = null;
                break;
            case "2":
                eventType = "RoboManiac - 300 Platinum";
                amount = 300;
                special = null;
                break;
            case "3":
                eventType = "RoboManiac - 650 Platinum";
                amount = 650;
                special = null;
                break;
            case "4":
                eventType = "RoboManiac - 1500 Platinum";
                amount = 1500;
                special = null;
                break;
            case "5":
                eventType = "RoboManiac - 4000 Platinum";
                amount = 4000;
                special = null;
                break;
            case "6":
                eventType = "RoboManiac - 10000 Platinum";
                amount = 10000;
                special = null;
                break;
            case "7":
                eventType = "RoboManiac - Pro Package";
                amount = 100;
                special = "professional_package";
                break;
            default:
                return res.status(400).json({ error: "Invalid packageId" });
        }

        const robotId = await getRobotIdbyUser(levelId, ndUserId);
        const timestamp = Math.floor(Date.now() / 1000);
        const logData = {
            userId: ndUserId,
            transaction_id: ndUserId,
            robotId,
            timestamp,
            method: "portal",
            amount,
            special,
            price: amount,
            currency: "gems",
            provider: "portal",
            itemCode: eventType,
            finished: 1,
            asCode: 0,
            language: "en",
        };

        await createPaymentLog(logData);
        const robot = await findRobot(robotId);
        const si = await getSeasonInfo(robot.habitat_id);

        if (
            robot.received_first_buy_bonus === 0 &&
            ![
                "starter_package",
                "professional_package",
                "halloween_package",
            ].includes(logData.special)
        ) {
            await earnPrice(
                { credits: 0, uridium: 100, platinum: 0 },
                robot.id
            );
            robot.received_first_buy_bonus = 1;
            await updateRobot(robot);
            await logCredits(
                robot.id,
                24,
                100,
                si.fight_season,
                si.fight_day,
                "uridium"
            );
            await logBookentry(
                robot.id,
                si.fight_season,
                si.fight_day,
                "uridium",
                24,
                100
            );
        }

        if (
            [
                "starter_package",
                "professional_package",
                "halloween_package",
            ].includes(logData.special)
        ) {
            await earnPackage(
                { credits: 0, uridium: 0, platinum: logData.amount },
                robot.id
            );
            await logCredits(
                robot.id,
                48,
                amount,
                si.fight_season,
                si.fight_day,
                "platinum"
            );
            await logBookentry(
                robot.id,
                si.fight_season,
                si.fight_day,
                "premium_special_package",
                48,
                amount
            );
        } else {
            await earnPrice(
                { credits: 0, uridium: 0, platinum: logData.amount },
                robot.id
            );
            await logCredits(
                robot.id,
                10,
                amount,
                si.fight_season,
                si.fight_day,
                "platinum"
            );
            await logBookentry(
                robot.id,
                si.fight_season,
                si.fight_day,
                "premium",
                10,
                amount
            );
        }

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
 * Finalizes a portal transaction after confirmation on the blockchain.
 * @param {Request} req - The request object, includes levelId and walletAddress in the URL and transaction details in the body.
 * @param {Response} res - The response object, returns whether the transaction was completed.
 */
exports.finalizePortalTransaction = async (req, res) => {
    const { levelId, walletAddress } = req.params;
    const { extract, inject } = req.body;

    const result = { extract: "false", inject: "false" };

    try {
        console.log(
            `Finalizing portal transaction for ${walletAddress} on level ${levelId}`,
            extract,
            inject
        );

        result.extract = await extractItems(extract, walletAddress);
        result.inject = await injectItems(levelId, walletAddress, inject);

        const success = result.extract === "true" && result.inject === "true";

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
 * Retrieves NFTs for a game level that are mapped to allowed game assets.
 * @param {Request} req - The request object, includes levelId in the URL, and expected NFT details in the body.
 * @param {Response} res - The response object, returns an array of allowed NFTs.
 */
exports.getNFTMap = async (req, res) => {
    const { levelId } = req.params;
    const nftDetails = req.body; // Array of { contractId, tokenId, quantity, nftType }

    try {
        const itemNames = await getItemNames();

        const allowedNFTsPromises = nftDetails.map(async (detail) => {
            const { slot, itemId, level, maxLevel } = await parseNftType(
                detail.nftType
            );
            return {
                gameLevel: levelId,
                itemId: detail.nftType,
                name: itemNames.get(itemId) || `Item ${itemId}`,
                description: "",
                nftType: detail.nftType,
                quantity: 1,
                quantityPerNft: 1,
                tokenId: detail.tokenId,
                uri: "",
                image: "",
                contractId: detail.contractId,
            };
        });

        const allowedNFTs = await Promise.all(allowedNFTsPromises);
        res.json(allowedNFTs);
    } catch (error) {
        console.error("Error processing NFT details:", error);
        res.status(500).json({ error: "Failed to process NFT details" });
    }
};

/**
 * Retrieves the user's inventory for a specific game level.
 * @param {Request} req - The request object, includes levelId and walletAddress in the URL.
 * @param {Response} res - The response object, returning the user's inventory items.
 */
exports.getUserInventory = async (req, res) => {
    const { levelId, walletAddress } = req.params;
    logToFile(
        `Received request for levelId: ${levelId}, walletAddress: ${walletAddress}`
    );

    try {
        const userInventoryFromDB = await getUserInventoryFromDB(
            levelId,
            walletAddress
        );
        logToFile(
            `Fetched user inventory from DB: ${JSON.stringify(
                userInventoryFromDB
            )}`
        );

        if (!userInventoryFromDB) {
            const message = "No inventory found for this user and level.";
            logToFile(message);
            return res.status(404).json({ message });
        }

        const itemNames = await getItemNames();
        logToFile(`Fetched item names: ${JSON.stringify(itemNames)}`);

        const items = userInventoryFromDB.map((item) => {
            const itemName =
                itemNames.get(item.item_id) || `Item ${item.item_id}`;
            const itemData = {
                gameLevel: levelId,
                itemId: item.id,
                name: itemName,
                description: "",
                nftType: item.nft_type,
                quantity: 1,
                quantityPerNft: 1,
                uri: "",
                image: "",
                contractId: contractId,
                canExtract: true,
            };
            logToFile(`Mapped item: ${JSON.stringify(itemData)}`);
            return itemData;
        });

        logToFile(`Final items array: ${JSON.stringify(items)}`);
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
 * Checks if a user's wallet is connected to a game user account.
 * @param {Request} req - The request object. Expects walletAddress in the URL.
 * @param {Response} res - The response object. Returns connection status.
 */
exports.isWalletConnected = async (req, res) => {
    const { walletAddress } = req.params;
    res.json({ connected: await walletConnected(walletAddress) });
};

/**
 * Checks if a user's NitroDome ID is connected to a game user account.
 * @param {Request} req - The request object. Expects ndUserId in the URL.
 * @param {Response} res - The response object. Returns connection status.
 */
exports.isUserConnected = async (req, res) => {
    const { ndUserId } = req.params;
    res.json({ connected: await userConnected(ndUserId) });
};

/**
 * Removes all assigned wallets for a user.
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
