//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PredictionMarketSimple
 * @dev Versión simplificada para garantizar deploy exitoso en Remix
 */
contract PredictionMarketSimple is Ownable, ReentrancyGuard {
    enum MarketOutcome {
        UNRESOLVED,
        OPTION_A,
        OPTION_B,
        CANCELLED
    }

    struct UserShares {
        uint256 optionA;
        uint256 optionB;
    }

    struct Market {
        string question;
        string optionA;
        string optionB;
        uint256 endTime;
        uint256 totalOptionAShares;
        uint256 totalOptionBShares;
        MarketOutcome outcome;
        bool resolved;
        mapping(address => UserShares) userShares;
        mapping(address => bool) hasClaimed;
    }

    // Custom Errors para gas efficiency
    error InvalidTokenAddress();
    error InvalidDuration();
    error MarketTradingEnded();
    error MarketAlreadyResolved();
    error MinimumBetRequired();
    error TokenTransferFailed();
    error MarketNotEnded();
    error InvalidOutcome();
    error MarketNotResolved();
    error AlreadyClaimed();
    error NoWinningsToClaim();
    error InsufficientAllowance();
    error InsufficientBalance();

    // Constante para allowance infinito
    uint256 private constant MAX_UINT256 = type(uint256).max;

    IERC20 public immutable bettingToken;
    uint256 public marketCount;
    uint256 public platformFeePercentage;
    address public feeCollector;
    
    mapping(uint256 => Market) public markets;

    event MarketCreated(uint256 indexed marketId, string question, string optionA, string optionB, uint256 endTime);
    event SharesPurchased(uint256 indexed marketId, address indexed buyer, bool isOptionA, uint256 amount);
    event MarketResolved(uint256 indexed marketId, MarketOutcome outcome);
    event Claimed(uint256 indexed marketId, address indexed user, uint256 amount);

    constructor(
        address _bettingToken,
        address _feeCollector,
        uint256 _initialFee
    ) Ownable(msg.sender) {
        if (_bettingToken == address(0)) revert InvalidTokenAddress();
        
        bettingToken = IERC20(_bettingToken);
        feeCollector = _feeCollector;
        platformFeePercentage = _initialFee;
    }

    function createMarket(
        string memory _question,
        string memory _optionA,
        string memory _optionB,
        uint256 _duration
    ) external onlyOwner returns (uint256 marketId) {
        if (_duration < 1 hours || _duration > 30 days) revert InvalidDuration();

        marketId = marketCount;
        marketCount++;
        
        Market storage market = markets[marketId];
        market.question = _question;
        market.optionA = _optionA;
        market.optionB = _optionB;
        market.endTime = block.timestamp + _duration;
        market.outcome = MarketOutcome.UNRESOLVED;

        emit MarketCreated(marketId, _question, _optionA, _optionB, market.endTime);
    }

    function buyShares(
        uint256 _marketId,
        bool _isOptionA,
        uint256 _amount
    ) external nonReentrant {
        Market storage market = markets[_marketId];
        if (block.timestamp >= market.endTime) revert MarketTradingEnded();
        if (market.resolved) revert MarketAlreadyResolved();
        if (_amount < 1e18) revert MinimumBetRequired();

        // Verificar balance y allowance ANTES de transferir
        if (bettingToken.balanceOf(msg.sender) < _amount) revert InsufficientBalance();
        if (bettingToken.allowance(msg.sender, address(this)) < _amount) revert InsufficientAllowance();

        if (!bettingToken.transferFrom(msg.sender, address(this), _amount)) revert TokenTransferFailed();

        if (_isOptionA) {
            market.userShares[msg.sender].optionA += _amount;
            market.totalOptionAShares += _amount;
        } else {
            market.userShares[msg.sender].optionB += _amount;
            market.totalOptionBShares += _amount;
        }

        emit SharesPurchased(_marketId, msg.sender, _isOptionA, _amount);
    }

    function resolveMarket(uint256 _marketId, MarketOutcome _outcome) external onlyOwner {
        Market storage market = markets[_marketId];
        if (block.timestamp < market.endTime) revert MarketNotEnded();
        if (market.resolved) revert MarketAlreadyResolved();
        if (_outcome == MarketOutcome.UNRESOLVED) revert InvalidOutcome();

        market.outcome = _outcome;
        market.resolved = true;

        emit MarketResolved(_marketId, _outcome);
    }

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
            uint256 totalStake = user.optionA + user.optionB;
            market.userShares[msg.sender] = UserShares(0, 0);
            
            bettingToken.transfer(msg.sender, totalStake);
            emit Claimed(_marketId, msg.sender, totalStake);
            return;
        }

        if (userShares == 0) revert NoWinningsToClaim();

        market.hasClaimed[msg.sender] = true;

        uint256 winnings = calculateWinnings(userShares, totalWinningShares, totalLosingShares);
        bettingToken.transfer(msg.sender, winnings);

        emit Claimed(_marketId, msg.sender, winnings);
    }

    function calculateWinnings(
        uint256 userShares,
        uint256 totalWinningShares,
        uint256 totalLosingShares
    ) internal view returns (uint256) {
        if (totalWinningShares == 0) return userShares;
        
        uint256 proportionalWinnings = (userShares * totalLosingShares) / totalWinningShares;
        uint256 winnings = userShares + proportionalWinnings;
        
        if (platformFeePercentage > 0) {
            uint256 fee = (winnings * platformFeePercentage) / 10000;
            winnings -= fee;
        }
        
        return winnings;
    }

    // ========== HELPER FUNCTIONS PARA ALLOWANCE INFINITO ==========

    /**
     * @notice Obtiene la cantidad máxima para allowance infinito
     * @return maxAmount La cantidad máxima (2^256 - 1)
     */
    function getMaxAllowance() external pure returns (uint256 maxAmount) {
        return MAX_UINT256;
    }

    /**
     * @notice Verifica si el usuario tiene allowance infinito
     * @param _user Dirección del usuario
     * @return isInfinite True si tiene allowance infinito o muy alto
     */
    function hasInfiniteAllowance(address _user) external view returns (bool isInfinite) {
        uint256 allowance = bettingToken.allowance(_user, address(this));
        // Consideramos "infinito" si es mayor a 10^30 (mucho más que supply total de tokens)
        return allowance >= 1e30;
    }

    /**
     * @notice Verifica si el usuario tiene allowance suficiente (considera infinito)
     * @param _user Dirección del usuario
     * @param _amount Cantidad que quiere apostar
     * @return isSufficient True si tiene allowance suficiente
     */
    function hasSufficientAllowance(address _user, uint256 _amount) external view returns (bool isSufficient) {
        uint256 allowance = bettingToken.allowance(_user, address(this));
        return allowance >= _amount;
    }

    /**
     * @notice Verifica si el usuario necesita hacer approve
     * @param _user Dirección del usuario
     * @param _amount Cantidad que quiere apostar
     * @return needsApprovalBool True si necesita hacer approve
     * @return suggestedAmount Cantidad sugerida para aprobar (infinito)
     */
    function needsApproval(address _user, uint256 _amount) 
        external 
        view 
        returns (bool needsApprovalBool, uint256 suggestedAmount) 
    {
        uint256 allowance = bettingToken.allowance(_user, address(this));
        
        if (allowance < _amount) {
            return (true, MAX_UINT256);  // Sugerir allowance infinito
        }
        
        return (false, 0);
    }

    /**
     * @notice Obtiene información completa del usuario incluyendo allowance infinito
     * @param _user Dirección del usuario
     * @param _amount Cantidad que quiere apostar
     * @return balance Balance de MXNB
     * @return allowance Allowance actual
     * @return hasInfinite Si tiene allowance infinito
     * @return needsApprovalForAmount Si necesita aprobar para una cantidad específica
     */
    function getUserInfoAdvanced(address _user, uint256 _amount) 
        external 
        view 
        returns (
            uint256 balance,
            uint256 allowance,
            bool hasInfinite,
            bool needsApprovalForAmount
        ) 
    {
        balance = bettingToken.balanceOf(_user);
        allowance = bettingToken.allowance(_user, address(this));
        hasInfinite = allowance >= 1e30;  // Consideramos esto como "infinito"
        needsApprovalForAmount = allowance < _amount;
    }

    /**
     * @notice Verifica si el usuario puede comprar shares considerando allowance infinito
     * @param _user Dirección del usuario
     * @param _amount Cantidad que quiere apostar
     * @return canBuy True si puede comprar
     * @return reason Razón si no puede comprar
     * @return suggestedAction Acción sugerida
     */
    function canUserBuySharesAdvanced(address _user, uint256 _amount) 
        external 
        view 
        returns (
            bool canBuy, 
            string memory reason,
            string memory suggestedAction
        ) 
    {
        uint256 balance = bettingToken.balanceOf(_user);
        uint256 allowance = bettingToken.allowance(_user, address(this));
        
        if (balance < _amount) {
            return (false, "Insufficient MXNB balance", "Get more MXNB tokens");
        }
        
        if (allowance < _amount) {
            return (false, "Insufficient allowance", "Approve infinite allowance");
        }
        
        return (true, "Ready to buy shares", "Proceed with purchase");
    }

    // ========== FUNCIONES HELPER ANTERIORES (ACTUALIZADAS) ==========

    /**
     * @notice Verifica si el usuario tiene suficiente allowance para apostar
     * @param _user Dirección del usuario
     * @param _amount Cantidad que quiere apostar
     * @return hasAllowance True si tiene allowance suficiente
     */
    function checkAllowance(address _user, uint256 _amount) external view returns (bool hasAllowance) {
        return bettingToken.allowance(_user, address(this)) >= _amount;
    }

    /**
     * @notice Obtiene el allowance actual del usuario
     * @param _user Dirección del usuario
     * @return allowance Cantidad aprobada
     */
    function getUserAllowance(address _user) external view returns (uint256 allowance) {
        return bettingToken.allowance(_user, address(this));
    }

    /**
     * @notice Obtiene el balance de MXNB del usuario
     * @param _user Dirección del usuario
     * @return balance Balance del usuario
     */
    function getUserBalance(address _user) external view returns (uint256 balance) {
        return bettingToken.balanceOf(_user);
    }

    /**
     * @notice Verifica si el usuario puede comprar shares (balance + allowance)
     * @param _user Dirección del usuario
     * @param _amount Cantidad que quiere apostar
     * @return canBuy True si puede comprar
     * @return reason Razón si no puede comprar
     */
    function canUserBuyShares(address _user, uint256 _amount) 
        external 
        view 
        returns (bool canBuy, string memory reason) 
    {
        uint256 balance = bettingToken.balanceOf(_user);
        uint256 allowance = bettingToken.allowance(_user, address(this));
        
        if (balance < _amount) {
            return (false, "Insufficient balance");
        }
        
        if (allowance < _amount) {
            return (false, "Insufficient allowance - approve infinite amount");
        }
        
        return (true, "Can buy shares");
    }

    /**
     * @notice Información completa del usuario para apostar
     * @param _user Dirección del usuario
     * @return balance Balance de MXNB
     * @return allowance Allowance actual
     * @return needsApprovalBool Si necesita aprobar más tokens
     */
    function getUserInfo(address _user) 
        external 
        view 
        returns (
            uint256 balance,
            uint256 allowance,
            bool needsApprovalBool
        ) 
    {
        balance = bettingToken.balanceOf(_user);
        allowance = bettingToken.allowance(_user, address(this));
        needsApprovalBool = allowance < 1e30;  // Necesita approval si no tiene "infinito"
    }

    // ========== FUNCIONES EXISTENTES ==========

    function getMarketInfo(uint256 _marketId)
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

    function getUserShares(uint256 _marketId, address _user) 
        external 
        view 
        returns (uint256 optionAShares, uint256 optionBShares) 
    {
        Market storage market = markets[_marketId];
        UserShares memory shares = market.userShares[_user];
        return (shares.optionA, shares.optionB);
    }
} 