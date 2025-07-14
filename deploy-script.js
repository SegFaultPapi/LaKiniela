const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying PredictionMarket contract...");
    
    // Parámetros del constructor
    const MXNB_TOKEN = "0x82B9e52b26A2954E113F94Ff26647754d5a4247D"; // Arbitrum Sepolia
    const FEE_COLLECTOR = "0xTU_WALLET_ADDRESS_AQUI"; // CAMBIAR POR TU WALLET
    const INITIAL_FEE = 100; // 1% fee
    
    console.log("📋 Deploy parameters:");
    console.log("- MXNB Token:", MXNB_TOKEN);
    console.log("- Fee Collector:", FEE_COLLECTOR);
    console.log("- Initial Fee:", INITIAL_FEE, "= 1%");
    
    // Deploy
    const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
    const predictionMarket = await PredictionMarket.deploy(
        MXNB_TOKEN,
        FEE_COLLECTOR,
        INITIAL_FEE,
        {
            gasLimit: 3500000  // Gas limit manual
        }
    );
    
    console.log("⏳ Waiting for deployment...");
    await predictionMarket.waitForDeployment();
    
    const address = await predictionMarket.getAddress();
    console.log("✅ PredictionMarket deployed to:", address);
    
    // Verificar deployment
    console.log("🔍 Verifying deployment...");
    const marketCount = await predictionMarket.marketCount();
    const bettingToken = await predictionMarket.bettingToken();
    
    console.log("- Market Count:", marketCount.toString());
    console.log("- Betting Token:", bettingToken);
    console.log("- Contract verified successfully! 🎉");
    
    return address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }); 