const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

router.get(
    "/isWalletConnected/:walletAddress",
    gameController.isWalletConnected
);
router.post(
    "/assignWalletToUser/:walletAddress",
    gameController.assignWalletToUser
);
router.post("/getNFTMap/:levelId", gameController.getNFTMap);

router.get(
    "/getUserInventory/:levelId/:walletAddress",
    gameController.getUserInventory
);
router.put(
    "/finalizePortalTransaction/:levelId/:walletAddress",
    gameController.finalizePortalTransaction
);
router.post(
    "/logoutUser",
    gameController.logoutUser
)

module.exports = router;
