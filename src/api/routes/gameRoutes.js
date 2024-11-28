const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

router.get(
    "/isWalletConnected/:walletAddress",
    gameController.isWalletConnected
);

router.get("/isUserConnected/:userId", gameController.isUserConnected);

router.post(
    "/assignWalletToUser/:walletAddress",
    gameController.assignWalletToUser
);

router.post("/assignUserToUser/:userId", gameController.assignNDUserToUser);

router.get("/getNFTMap/:levelId", gameController.getNFTMap);

router.get(
    "/getUserInventory/:levelId/:walletAddress",
    gameController.getUserInventory
);

router.post(
    "/submitPortalTransaction/:levelId/:walletAddress",
    gameController.submitPortalTransaction
);

router.post("/cancelPortalTransaction", gameController.cancelPortalTransaction);

router.put(
    "/finalizePortalTransaction/:levelId/:walletAddress",
    gameController.finalizePortalTransaction
);

router.post("/logoutUser", gameController.logoutUser);

module.exports = router;
