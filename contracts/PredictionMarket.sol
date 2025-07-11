//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/*
 * NOTA: Este contrato es solo para CONSULTA y REFERENCIA
 * No requiere compilación ni instalación de dependencias OpenZeppelin
 * Las dependencias se resolverían al compilar en un entorno Solidity apropiado
 */

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PredictionMarket
 * @dev A prediction market contract where users can bet on outcomes and claim winnings based on the result.
 */
contract PredictionMarket is Ownable, ReentrancyGuard {
    /// @notice Market prediction outcome enum
    enum MarketOutcome {
        UNRESOLVED,
        OPTION_A,
        OPTION_B
    }

    /// @dev Represents a prediction market.
    struct Market {
        string question;
        uint256 endTime;
        MarketOutcome outcome;
        string optionA;
        string optionB;
        uint256 totalOptionAShares;
        uint256 totalOptionBShares;
        bool resolved;
        mapping(address => uint256) optionASharesBalance;
        mapping(address => uint256) optionBSharesBalance;
        // new mapping to track if user has claimed winnings
        mapping(address => bool) hasClaimed;
    }

    IERC20 public bettingToken;
    uint256 public marketCount;
    mapping(uint256 => Market) public markets;

    /// @notice Emitted when a new market is created.
    event MarketCreated(
        uint256 indexed marketId,
        string question,
        string optionA,
        string optionB,
        uint256 endTime
    );

    /// @notice Emitted when shares are purchased in a market.
    event SharesPurchased(
        uint256 indexed marketId,
        address indexed buyer,
        bool isOptionA,
        uint256 amount
    );

    /// @notice Emitted when a market is resolved with an outcome.
    event MarketResolved(uint256 indexed marketId, MarketOutcome outcome);

    /// @notice Emitted when winnings are claimed by a user.
    event Claimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );

    /**
     * @dev Sets the betting token address and initializes the contract owner.
     * @param _bettingToken The address of the token used for betting.
     */
    constructor(address _bettingToken) {
        bettingToken = IERC20(_bettingToken);
        _setupOwner(msg.sender); // Set the contract deployer as the owner
    }

    /**
     * @dev Required override for Thirdweb's Ownable extension.
     * @return True if the caller is the contract owner.
     */
    function _canSetOwner() internal view virtual override returns (bool) {
        return msg.sender == owner();
    }

    /**
     * @notice Creates a new prediction market.
     * @param _question The question for the market.
     * @param _optionA The first option for the market.
     * @param _optionB The second option for the market.
     * @param _duration The duration for which the market is active.
     * @return marketId The ID of the newly created market.
     */
    function createMarket(
        string memory _question,
        string memory _optionA,
        string memory _optionB,
        uint256 _duration
    ) external returns (uint256) {
        require(msg.sender == owner(), "Only owner can create markets");
        require(_duration > 0, "Duration must be positive");
        require(
            bytes(_optionA).length > 0 && bytes(_optionB).length > 0,
            "Options cannot be empty"
        );

        uint256 marketId = marketCount++;
        Market storage market = markets[marketId];

        market.question = _question;
        market.optionA = _optionA;
        market.optionB = _optionB;
        market.endTime = block.timestamp + _duration;
        market.outcome = MarketOutcome.UNRESOLVED;

        emit MarketCreated(
            marketId,
            _question,
            _optionA,
            _optionB,
            market.endTime
        );
        return marketId;
    }

    /**
     * @notice Allows users to buy shares in a market.
     * @param _marketId The ID of the market to buy shares in.
     * @param _isOptionA True if buying shares for Option A, false for Option B.
     * @param _amount The amount of shares to buy.
     */
    function buyShares(
        uint256 _marketId,
        bool _isOptionA,
        uint256 _amount
    ) external {
        Market storage market = markets[_marketId];
        require(
            block.timestamp < market.endTime,
            "Market trading period has ended"
        );
        require(!market.resolved, "Market already resolved");
        require(_amount > 0, "Amount must be positive");

        require(
            bettingToken.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );

        if (_isOptionA) {
            market.optionASharesBalance[msg.sender] += _amount;
            market.totalOptionAShares += _amount;
        } else {
            market.optionBSharesBalance[msg.sender] += _amount;
            market.totalOptionBShares += _amount;
        }

        emit SharesPurchased(_marketId, msg.sender, _isOptionA, _amount);
    }

    /**
     * @notice Resolves a market by setting the outcome.
     * @param _marketId The ID of the market to resolve.
     * @param _outcome The outcome to set for the market.
     */
    function resolveMarket(uint256 _marketId, MarketOutcome _outcome) external {
        require(msg.sender == owner(), "Only owner can resolve markets");
        Market storage market = markets[_marketId];
        require(block.timestamp >= market.endTime, "Market hasn't ended yet");
        require(!market.resolved, "Market already resolved");
        require(_outcome != MarketOutcome.UNRESOLVED, "Invalid outcome");

        market.outcome = _outcome;
        market.resolved = true;

        emit MarketResolved(_marketId, _outcome);
    }

    /**
     * @notice Claims winnings for the caller if they participated in a resolved market.
     * @param _marketId The ID of the market to claim winnings from.
     */
    function claimWinnings(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved yet");

        uint256 userShares;
        uint256 winningShares;
        uint256 losingShares;

        if (market.outcome == MarketOutcome.OPTION_A) {
            userShares = market.optionASharesBalance[msg.sender];
            winningShares = market.totalOptionAShares;
            losingShares = market.totalOptionBShares;
            market.optionASharesBalance[msg.sender] = 0;
        } else if (market.outcome == MarketOutcome.OPTION_B) {
            userShares = market.optionBSharesBalance[msg.sender];
            winningShares = market.totalOptionBShares;
            losingShares = market.totalOptionAShares;
            market.optionBSharesBalance[msg.sender] = 0;
        } else {
            revert("Market outcome is not valid");
        }

        require(userShares > 0, "No winnings to claim");

        // Calculate the reward ratio
        uint256 rewardRatio = (losingShares * 1e18) / winningShares; // Using 1e18 for precision

        // Calculate winnings: original stake + proportional share of losing funds
        uint256 winnings = userShares + (userShares * rewardRatio) / 1e18;

        require(
            bettingToken.transfer(msg.sender, winnings),
            "Token transfer failed"
        );

        emit Claimed(_marketId, msg.sender, winnings);
    }

    /**
     * @notice Returns detailed information about a specific market.
     * @param _marketId The ID of the market to retrieve information for.
     * @return question The market's question.
     * @return optionA The first option for the market.
     * @return optionB The second option for the market.
     * @return endTime The end time of the market.
     * @return outcome The outcome of the market.
     * @return totalOptionAShares Total shares bought for Option A.
     * @return totalOptionBShares Total shares bought for Option B.
     * @return resolved Whether the market has been resolved.
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
            market.totalOptionAShares,
            market.totalOptionBShares,
            market.resolved
        );
    }

    /**
     * @notice Returns the shares balance for a specific user in a market.
     * @param _marketId The ID of the market to check.
     * @param _user The address of the user to check balance for.
     * @return optionAShares The user's shares for Option A.
     * @return optionBShares The user's shares for Option B.
     */
    function getSharesBalance(
        uint256 _marketId,
        address _user
    ) external view returns (uint256 optionAShares, uint256 optionBShares) {
        Market storage market = markets[_marketId];
        return (
            market.optionASharesBalance[_user],
            market.optionBSharesBalance[_user]
        );
    }

    /**
     * @notice Allows multiple users to claim their winnings in a batch for a given market.
     * @param _marketId The ID of the market for which winnings are claimed.
     * @param _users Array of user addresses who wish to claim their winnings.
     */
    function batchClaimWinnings(
        uint256 _marketId,
        address[] calldata _users
    ) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved yet");

        for (uint256 i = 0; i < _users.length; i++) {
            address user = _users[i];

            // Skip if the user already claimed
            if (market.hasClaimed[user]) {
                continue;
            }

            uint256 userShares;
            uint256 winningShares;
            uint256 losingShares;

            // Determine user shares and winning/losing shares based on the outcome
            if (market.outcome == MarketOutcome.OPTION_A) {
                userShares = market.optionASharesBalance[user];
                winningShares = market.totalOptionAShares;
                losingShares = market.totalOptionBShares;
                market.optionASharesBalance[user] = 0; //Reset user shares after claim
            } else if (market.outcome == MarketOutcome.OPTION_B) {
                userShares = market.optionBSharesBalance[user];
                winningShares = market.totalOptionBShares;
                losingShares = market.totalOptionAShares;
                market.optionBSharesBalance[user] = 0; // Reset user's shares after claim
            } else {
                revert("Market outcome is not valid");
            }

            // We need to ensure the user has winnings to claim
            if (userShares == 0) {
                continue;
            }

            // Calculate the reward ratio and user's winnings
            uint256 rewardRatio = (losingShares * 1e18) / winningShares;
            uint256 winnings = userShares + (userShares * rewardRatio) / 1e18;

            // Mark the user as having claimed winnings
            market.hasClaimed[user] = true;

            // Transfer winnings to the user
            require(
                bettingToken.transfer(user, winnings),
                "Token transfer failed"
            );

            // emit and event for each user who claimed winnings
            emit Claimed(_marketId, user, winnings);
        }
    }
}
