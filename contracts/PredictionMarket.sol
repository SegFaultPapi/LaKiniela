//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PredictionMarket
 * @dev A prediction market contract for LA KINIELA platform where users can bet on outcomes using MXNB tokens
 */
contract PredictionMarket is Ownable, ReentrancyGuard {
    /// @notice Market prediction outcome enum
    enum MarketOutcome {
        UNRESOLVED,
        OPTION_A,
        OPTION_B,
        CANCELLED
    }

    /// @dev User shares structure to track balances
    struct UserShares {
        uint128 optionA;  // Reduced from uint256 to uint128 - still huge numbers but saves gas
        uint128 optionB;  // This packs both into one storage slot
    }

    /// @dev Represents a prediction market - optimized for gas
    struct Market {
        string question;
        string optionA;
        string optionB;
        uint256 endTime;
        uint128 totalOptionAShares;  // Reduced from uint256 - saves storage slot
        uint128 totalOptionBShares;  // Packed with totalOptionAShares
        MarketOutcome outcome;       // 8 bits
        bool resolved;              // 8 bits - packed with outcome in same slot
        mapping(address => UserShares) userShares;
        mapping(address => bool) hasClaimed;
    }

    // ==================== CUSTOM ERRORS - MAJOR GAS OPTIMIZATION ====================
    error InvalidTokenAddress();
    error TokenAddressNotContract();
    error InvalidFeeCollector();
    error FeeExceedsMaximum();
    error InvalidDuration();
    error QuestionCannotBeEmpty();
    error OptionsCannotBeEmpty();
    error MarketTradingEnded();
    error MarketAlreadyResolved();
    error MinimumBetRequired();
    error AmountTooLarge();
    error TokenTransferFailed();
    error MarketNotEnded();
    error InvalidOutcome();
    error UseRegularResolve();
    error MarketNotResolved();
    error AlreadyClaimed();
    error NoStakeToRefund();
    error RefundFailed();
    error InvalidMarketOutcome();
    error NoWinningsToClaim();
    error InvalidAddress();
    error OnlyFeeCollectorCanWithdraw();
    error NoFeesToWithdraw();
    error NoFeesAvailable();
    error TransferFailed();

    /// @notice The MXNB token used for betting
    IERC20 public immutable bettingToken;
    
    /// @notice Counter for market IDs and platform fee packed together
    uint128 public marketCount;              // Reduced from uint256
    uint128 public platformFeePercentage;    // Packed with marketCount
    
    /// @notice Mapping of market ID to Market struct
    mapping(uint256 => Market) public markets;
    
    /// @notice Address where platform fees are collected
    address public feeCollector;

    /// @notice Track total funds in unresolved markets for gas optimization
    uint256 private totalActiveMarketFunds;

    /// @notice Emitted when a new market is created
    event MarketCreated(
        uint256 indexed marketId,
        string question,
        string optionA,
        string optionB,
        uint256 endTime
    );

    /// @notice Emitted when shares are purchased in a market
    event SharesPurchased(
        uint256 indexed marketId,
        address indexed buyer,
        bool isOptionA,
        uint256 amount
    );

    /// @notice Emitted when a market is resolved with an outcome
    event MarketResolved(uint256 indexed marketId, MarketOutcome outcome);

    /// @notice Emitted when a market is terminated early
    event MarketTerminated(uint256 indexed marketId, MarketOutcome outcome);

    /// @notice Emitted when winnings are claimed by a user
    event Claimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );

    /// @notice Emitted when platform fee is updated
    event FeeUpdated(uint256 newFeePercentage);

    /// @notice Emitted when fee collector is updated
    event FeeCollectorUpdated(address newFeeCollector);

    /**
     * @dev Sets the betting token address and initializes the contract
     * @param _bettingToken The address of the MXNB token used for betting
     * @param _feeCollector Address where platform fees will be sent
     * @param _initialFee Initial platform fee percentage (1 = 0.01%)
     */
    constructor(
        address _bettingToken,
        address _feeCollector,
        uint256 _initialFee
    )Ownable(msg.sender){
        if (_bettingToken == address(0)) revert InvalidTokenAddress();
        if (!_isContract(_bettingToken)) revert TokenAddressNotContract();
        if (_feeCollector == address(0)) revert InvalidFeeCollector();
        if (_initialFee > 500) revert FeeExceedsMaximum();

        bettingToken = IERC20(_bettingToken);
        feeCollector = _feeCollector;
        platformFeePercentage = uint128(_initialFee);
    }

    /**
     * @dev Internal function to check if address is a contract - OPTIMIZED
     */
    function _isContract(address _addr) private view returns (bool) {
        return _addr.code.length > 0;
    }

    /**
     * @notice Creates a new prediction market
     * @param _question The question for the market
     * @param _optionA The first option for the market
     * @param _optionB The second option for the market
     * @param _duration Duration in seconds for which the market will be active
     * @return marketId The ID of the newly created market
     */
    function createMarket(
        string calldata _question,  // Changed to calldata to save gas
        string calldata _optionA,   // Changed to calldata to save gas
        string calldata _optionB,   // Changed to calldata to save gas
        uint256 _duration
    ) external onlyOwner returns (uint256 marketId) {
        if (_duration < 1 hours || _duration > 30 days) revert InvalidDuration();
        if (bytes(_question).length == 0) revert QuestionCannotBeEmpty();
        if (bytes(_optionA).length == 0 || bytes(_optionB).length == 0) revert OptionsCannotBeEmpty();

        marketId = marketCount;
        unchecked {
            marketCount++;  // Safe to use unchecked here
        }
        
        Market storage market = markets[marketId];
        market.question = _question;
        market.optionA = _optionA;
        market.optionB = _optionB;
        market.endTime = block.timestamp + _duration;  // Simplified - no assembly
        market.outcome = MarketOutcome.UNRESOLVED;

        emit MarketCreated(marketId, _question, _optionA, _optionB, market.endTime);
    }

    /**
     * @notice Allows users to buy shares in a market
     * @param _marketId The ID of the market
     * @param _isOptionA True for Option A, false for Option B
     * @param _amount Amount of MXNB tokens to bet
     */
    function buyShares(
        uint256 _marketId,
        bool _isOptionA,
        uint256 _amount
    ) external nonReentrant {
        Market storage market = markets[_marketId];
        if (block.timestamp >= market.endTime) revert MarketTradingEnded();
        if (market.resolved) revert MarketAlreadyResolved();
        if (_amount < 1e18) revert MinimumBetRequired();
        if (_amount > type(uint128).max) revert AmountTooLarge();

        if (!bettingToken.transferFrom(msg.sender, address(this), _amount)) revert TokenTransferFailed();

        // Cache user shares to reduce storage reads
        UserShares storage userShares = market.userShares[msg.sender];
        uint128 amount128 = uint128(_amount);
        
        // Simplified - no assembly
        if (_isOptionA) {
            userShares.optionA += amount128;
            market.totalOptionAShares += amount128;
        } else {
            userShares.optionB += amount128;
            market.totalOptionBShares += amount128;
        }

        // Update total active market funds
        unchecked {
            totalActiveMarketFunds += _amount;  // Safe overflow check
        }

        emit SharesPurchased(_marketId, msg.sender, _isOptionA, _amount);
    }

    /**
     * @notice Resolves a market by setting the outcome
     * @param _marketId The ID of the market to resolve
     * @param _outcome The outcome to set (OPTION_A, OPTION_B or CANCELLED)
     */
    function resolveMarket(uint256 _marketId, MarketOutcome _outcome) external onlyOwner {
        Market storage market = markets[_marketId];
        if (block.timestamp < market.endTime) revert MarketNotEnded();
        if (market.resolved) revert MarketAlreadyResolved();
        if (_outcome == MarketOutcome.UNRESOLVED) revert InvalidOutcome();

        market.outcome = _outcome;
        market.resolved = true;

        // Update total active market funds
        uint256 marketTotal = uint256(market.totalOptionAShares) + uint256(market.totalOptionBShares);
        totalActiveMarketFunds -= marketTotal;

        emit MarketResolved(_marketId, _outcome);
    }
    
    /**
     * @notice Emergency function to terminate and resolve a market early
     * @dev Only owner can call this in exceptional circumstances
     * @param _marketId The ID of the market to terminate
     * @param _outcome The outcome to set (OPTION_A, OPTION_B or CANCELLED)
     */
    function emergencyResolveMarket(
        uint256 _marketId, 
        MarketOutcome _outcome
    ) external onlyOwner {
        Market storage market = markets[_marketId];
        if (market.resolved) revert MarketAlreadyResolved();
        if (_outcome == MarketOutcome.UNRESOLVED) revert InvalidOutcome();
        if (block.timestamp >= market.endTime) revert UseRegularResolve();
        
        // Terminar inmediatamente
        market.endTime = block.timestamp;
        market.outcome = _outcome;
        market.resolved = true;

        // Update total active market funds
        uint256 marketTotal = uint256(market.totalOptionAShares) + uint256(market.totalOptionBShares);
        totalActiveMarketFunds -= marketTotal;

        emit MarketTerminated(_marketId, _outcome);
        emit MarketResolved(_marketId, _outcome);
    }

    /**
     * @notice Claims winnings for the caller in a resolved market
     * @param _marketId The ID of the market to claim from
     */
    function claimWinnings(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        if (!market.resolved) revert MarketNotResolved();
        if (market.hasClaimed[msg.sender]) revert AlreadyClaimed();

        UserShares memory user = market.userShares[msg.sender];
        uint256 userShares;
        uint256 totalWinningShares;
        uint256 totalLosingShares;

        if (market.outcome == MarketOutcome.OPTION_A) {
            userShares = user.optionA;
            totalWinningShares = market.totalOptionAShares;
            totalLosingShares = market.totalOptionBShares;
            market.userShares[msg.sender].optionA = 0;
        } else if (market.outcome == MarketOutcome.OPTION_B) {
            userShares = user.optionB;
            totalWinningShares = market.totalOptionBShares;
            totalLosingShares = market.totalOptionAShares;
            market.userShares[msg.sender].optionB = 0;
        } else if (market.outcome == MarketOutcome.CANCELLED) {
            // Return original stake if market was cancelled
            uint256 totalStake = uint256(user.optionA) + uint256(user.optionB);
            if (totalStake == 0) revert NoStakeToRefund();
            market.userShares[msg.sender] = UserShares(0, 0);
            
            if (!bettingToken.transfer(msg.sender, totalStake)) revert RefundFailed();
            emit Claimed(_marketId, msg.sender, totalStake);
            return;
        } else {
            revert InvalidMarketOutcome();
        }

        if (userShares == 0) revert NoWinningsToClaim();

        market.hasClaimed[msg.sender] = true;

        uint256 winnings = calculateWinnings(userShares, totalWinningShares, totalLosingShares);
        if (!bettingToken.transfer(msg.sender, winnings)) revert TokenTransferFailed();

        emit Claimed(_marketId, msg.sender, winnings);
    }

    /**
     * @dev Calculates winnings based on shares and market outcome - OPTIMIZED
     */
    function calculateWinnings(
        uint256 userShares,
        uint256 totalWinningShares,
        uint256 totalLosingShares
    ) internal view returns (uint256) {
        if (totalWinningShares == 0) return userShares;
        
        // More gas-efficient calculation
        uint256 proportionalWinnings = (userShares * totalLosingShares) / totalWinningShares;
        uint256 winnings = userShares + proportionalWinnings;
        
        // Apply platform fee if exists
        if (platformFeePercentage > 0) {
            unchecked {
                uint256 fee = (winnings * platformFeePercentage) / 10000;
                winnings -= fee;
            }
        }
        
        return winnings;
    }

    /**
     * @notice Updates the platform fee percentage
     * @param _newFeePercentage New fee percentage (1 = 0.01%)
     */
    function updatePlatformFee(uint256 _newFeePercentage) external onlyOwner {
        if (_newFeePercentage > 500) revert FeeExceedsMaximum();
        platformFeePercentage = uint128(_newFeePercentage);
        emit FeeUpdated(_newFeePercentage);
    }

    /**
     * @notice Updates the fee collector address
     * @param _newFeeCollector New address to receive fees
     */
    function updateFeeCollector(address _newFeeCollector) external onlyOwner {
        if (_newFeeCollector == address(0)) revert InvalidAddress();
        feeCollector = _newFeeCollector;
        emit FeeCollectorUpdated(_newFeeCollector);
    }

    /**
     * @notice Withdraws collected fees to the fee collector - OPTIMIZED VERSION
     */
    function withdrawFees() external {
        if (msg.sender != feeCollector) revert OnlyFeeCollectorCanWithdraw();
        
        uint256 balance = bettingToken.balanceOf(address(this));
        if (balance == 0) revert NoFeesToWithdraw();
        
        // Use cached total instead of expensive loop
        uint256 availableFees = balance - totalActiveMarketFunds;
        if (availableFees == 0) revert NoFeesAvailable();
        
        if (!bettingToken.transfer(feeCollector, availableFees)) revert TransferFailed();
    }

    /**
     * @notice Returns detailed information about a market
     */
    function getMarketInfo(
        uint256 _marketId
    )
        external
        view
        returns (
            string memory question,
            string memory optionA,
            string memory optionB,
            uint256 endTime,
            MarketOutcome outcome,
            uint256 totalOptionAShares,
            uint256 totalOptionBShares,
            bool resolved
        )
    {
        Market storage market = markets[_marketId];
        return (
            market.question,
            market.optionA,
            market.optionB,
            market.endTime,
            market.outcome,
            uint256(market.totalOptionAShares),
            uint256(market.totalOptionBShares),
            market.resolved
        );
    }

    /**
     * @notice Returns user's shares in a market
     */
    function getUserShares(
        uint256 _marketId,
        address _user
    ) external view returns (uint256 optionAShares, uint256 optionBShares) {
        Market storage market = markets[_marketId];
        UserShares memory shares = market.userShares[_user];
        return (uint256(shares.optionA), uint256(shares.optionB));
    }

    /**
     * @notice Checks if user has claimed winnings for a market
     */
    function hasClaimed(uint256 _marketId, address _user) external view returns (bool) {
        return markets[_marketId].hasClaimed[_user];
    }

    /**
     * @notice Calculates potential winnings for a user in an unresolved market
     */
    function calculatePotentialWinnings(
        uint256 _marketId,
        address _user
    ) external view returns (uint256 potentialWinnings) {
        Market storage market = markets[_marketId];
        if (market.resolved) revert MarketAlreadyResolved();
        
        UserShares memory user = market.userShares[_user];
        
        if (user.optionA > 0) {
            return calculateWinnings(uint256(user.optionA), uint256(market.totalOptionAShares), uint256(market.totalOptionBShares));
        } else if (user.optionB > 0) {
            return calculateWinnings(uint256(user.optionB), uint256(market.totalOptionBShares), uint256(market.totalOptionAShares));
        }
        
        return 0;
    }
}