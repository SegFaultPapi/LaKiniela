export const PREDICTION_MARKET_SIMPLE_ABI = [
  // Constructor
  {
    "inputs": [
      { "internalType": "address", "name": "_bettingToken", "type": "address" },
      { "internalType": "address", "name": "_feeCollector", "type": "address" },
      { "internalType": "uint256", "name": "_initialFee", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },

  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "Claimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "question", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "optionA", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "optionB", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256" }
    ],
    "name": "MarketCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "indexed": false, "internalType": "uint8", "name": "outcome", "type": "uint8" }
    ],
    "name": "MarketResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": false, "internalType": "bool", "name": "isOptionA", "type": "bool" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "SharesPurchased",
    "type": "event"
  },

  // Custom Errors
  {
    "inputs": [],
    "name": "AlreadyClaimed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidDuration",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidOutcome",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTokenAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketAlreadyResolved",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketNotEnded",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketNotResolved",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketTradingEnded",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MinimumBetRequired",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoWinningsToClaim",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TokenTransferFailed",
    "type": "error"
  },

  // Read Functions
  {
    "inputs": [],
    "name": "bettingToken",
    "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "canUserBuyShares",
    "outputs": [
      { "internalType": "bool", "name": "canBuy", "type": "bool" },
      { "internalType": "string", "name": "reason", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "canUserBuySharesAdvanced",
    "outputs": [
      { "internalType": "bool", "name": "canBuy", "type": "bool" },
      { "internalType": "string", "name": "reason", "type": "string" },
      { "internalType": "string", "name": "suggestedAction", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "checkAllowance",
    "outputs": [{ "internalType": "bool", "name": "hasAllowance", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeCollector",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_marketId", "type": "uint256" }
    ],
    "name": "getMarketInfo",
    "outputs": [
      { "internalType": "string", "name": "question", "type": "string" },
      { "internalType": "string", "name": "optionA", "type": "string" },
      { "internalType": "string", "name": "optionB", "type": "string" },
      { "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "internalType": "uint8", "name": "outcome", "type": "uint8" },
      { "internalType": "uint256", "name": "totalOptionAShares", "type": "uint256" },
      { "internalType": "uint256", "name": "totalOptionBShares", "type": "uint256" },
      { "internalType": "bool", "name": "resolved", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMaxAllowance",
    "outputs": [{ "internalType": "uint256", "name": "maxAmount", "type": "uint256" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" }
    ],
    "name": "getUserAllowance",
    "outputs": [{ "internalType": "uint256", "name": "allowance", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" }
    ],
    "name": "getUserBalance",
    "outputs": [{ "internalType": "uint256", "name": "balance", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" }
    ],
    "name": "getUserInfo",
    "outputs": [
      { "internalType": "uint256", "name": "balance", "type": "uint256" },
      { "internalType": "uint256", "name": "allowance", "type": "uint256" },
      { "internalType": "bool", "name": "needsApprovalBool", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "getUserInfoAdvanced",
    "outputs": [
      { "internalType": "uint256", "name": "balance", "type": "uint256" },
      { "internalType": "uint256", "name": "allowance", "type": "uint256" },
      { "internalType": "bool", "name": "hasInfinite", "type": "bool" },
      { "internalType": "bool", "name": "needsApprovalForAmount", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_marketId", "type": "uint256" },
      { "internalType": "address", "name": "_user", "type": "address" }
    ],
    "name": "getUserShares",
    "outputs": [
      { "internalType": "uint256", "name": "optionAShares", "type": "uint256" },
      { "internalType": "uint256", "name": "optionBShares", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" }
    ],
    "name": "hasInfiniteAllowance",
    "outputs": [{ "internalType": "bool", "name": "isInfinite", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "hasSufficientAllowance",
    "outputs": [{ "internalType": "bool", "name": "isSufficient", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "marketCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "markets",
    "outputs": [
      { "internalType": "string", "name": "question", "type": "string" },
      { "internalType": "string", "name": "optionA", "type": "string" },
      { "internalType": "string", "name": "optionB", "type": "string" },
      { "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "internalType": "uint256", "name": "totalOptionAShares", "type": "uint256" },
      { "internalType": "uint256", "name": "totalOptionBShares", "type": "uint256" },
      { "internalType": "uint8", "name": "outcome", "type": "uint8" },
      { "internalType": "bool", "name": "resolved", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "needsApproval",
    "outputs": [
      { "internalType": "bool", "name": "needsApprovalBool", "type": "bool" },
      { "internalType": "uint256", "name": "suggestedAmount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFeePercentage",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },

  // Write Functions
  {
    "inputs": [
      { "internalType": "uint256", "name": "_marketId", "type": "uint256" },
      { "internalType": "bool", "name": "_isOptionA", "type": "bool" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "buyShares",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_marketId", "type": "uint256" }
    ],
    "name": "claimWinnings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_question", "type": "string" },
      { "internalType": "string", "name": "_optionA", "type": "string" },
      { "internalType": "string", "name": "_optionB", "type": "string" },
      { "internalType": "uint256", "name": "_duration", "type": "uint256" }
    ],
    "name": "createMarket",
    "outputs": [{ "internalType": "uint256", "name": "marketId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_marketId", "type": "uint256" },
      { "internalType": "uint8", "name": "_outcome", "type": "uint8" }
    ],
    "name": "resolveMarket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const; 