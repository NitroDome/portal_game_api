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
router.get("/getContracts/:level", gameController.getContracts);
router.post("/getNFTMap/:levelID", gameController.getNFTMap);
router.get(
    "/getUserInventory/:levelID/:walletAddress",
    gameController.getUserInventory
);
router.put(
    "/finalizePortalTransaction",
    gameController.finalizePortalTransaction
);

module.exports = router;
