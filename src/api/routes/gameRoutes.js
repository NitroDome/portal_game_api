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
router.get("/getContracts/:levelId", gameController.getContracts);
router.post("/getNFTMap/:levelId", gameController.getNFTMap);
router.get(
    "/getUserInventory/:levelId/:walletAddress",
    gameController.getUserInventory
);
router.put(
    "/finalizePortalTransaction",
    gameController.finalizePortalTransaction
);

module.exports = router;
