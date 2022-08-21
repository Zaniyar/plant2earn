// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./interfaces/IPlant.sol";
import "./interfaces/IPlantDrawer.sol";

/// @title Plant NFTs
/// @notice Plant generated NFTs
contract Plant is ERC721Enumerable, IPlant, Ownable, ReentrancyGuard {

    /// @dev The address of the plantDrawer Contract
    address private immutable _plantContractAddress;

    /// @dev Price for one Plant
    uint256 public constant SELL_PRICE = 0.02 ether;
    /// @dev Price for seeding a Plant
    uint256 public constant SEEDING_PRICE = SELL_PRICE / 20;
    /// @dev Price for watering a Plant
    uint256 public constant WATERING_PRICE = SELL_PRICE / 100;

    /// @dev Amount of how many times a plant needs watering before harvesting or levelup is possible
    uint8 public constant MAX_WATERING_COUNTER = 10;
    /// @dev Maximum actions on a plant
    uint8 public constant MAX_HARVEST_LEVEL_COUNTER = 50;
    /// @dev Amount that can be harvested with level 1
    uint8 public constant HARVEST_AMOUNT = 20;

    /// @dev The token ID plant details
    mapping(uint256 => Details) private _details;

    /// @dev Sum of all Tokens distrubuted
    uint256 private _distributedTokens;

    /// @dev Tokens distrubuted per wallet
    mapping(address => uint256) private _distributedTokensPerWallet;

    /// @dev Flag to enable/disable timer function for demonstration
    bool private _isTimerActive = true;
    /// @dev Time in seconds when next action(water/harvest/levelUp) on the plant is possible
    uint256 private _timeUntilNextAction = 60 * 1; // 1 minute
    /// @dev Time in seconds when plant dies without an action
    uint private _timeUntilRotted = 60 * 2; // 2 minutes

    /// @dev Modifier to check if the next action is within the desired timespan
    modifier withinTimeSpan(uint256 tokenId) {
        uint256 timestamp = _details[tokenId].lastActionTimestamp;
        uint currentTimestamp = block.timestamp;
        if(_isTimerActive && timestamp != 0){
            require(timestamp +  _timeUntilNextAction < currentTimestamp, "too early for next action");
            require(timestamp +  _timeUntilRotted > currentTimestamp, "too late for next action");
        }
        _;
   }

    /// @dev List of Factor per level times 1000
    uint256[] public LEVEL_FACTOR_PER_LEVEL = [
        1000,
        1050,
        1103,
        1158,
        1216,
        1276,
        1340,
        1407,
        1477,
        1551,
        1629,
        1710,
        1796,
        1886,
        1980,
        2079,
        2183,
        2292,
        2407,
        2527,
        2653,
        2786,
        2925,
        3072,
        3225,
        3386,
        3556,
        3733,
        3920,
        4116,
        4322,
        4538,
        4765,
        5003,
        5253,
        5516,
        5792,
        6081,
        6385,
        6705,
        7040,
        7392,
        7762,
        8150,
        8557,
        8985,
        9434,
        9906,
        10401,
        10921
    ];

    constructor(address plantContractAddress) ERC721("Plant", "PLT") { 
        _plantContractAddress = plantContractAddress;
    }

    /// @inheritdoc IPlant
    function getDetails(uint256 tokenId) public view override returns (Details memory details) {
        details = _details[tokenId];
    }

    /// @dev Method to get the timer for demonstration
    /// @return The IsTimerActive boolean
    function getIsTimerActive() external view returns (bool){
        return _isTimerActive;
    }

    /// @dev Method to enable/disable timer for demonstration
    /// @param active flag to enable disable timer
    function setIsTimerActive(bool active) external onlyOwner {
        _isTimerActive = active;
    }

    /// @dev Method to get the _timeUntilNextAction
    /// @return The time until next action in seconds
    function getTimeUntilNextAction() external view returns (uint256){
        return _timeUntilNextAction;
    }

    /// @dev Method to set the _timeUntilNextAction for demonstration
    /// @param timeUntilNextAction in seconds until next action is allowed
    function setTimeUntilNextAction(uint256 timeUntilNextAction) external onlyOwner {
        _timeUntilNextAction = timeUntilNextAction;
    }

    /// @dev Method to get the _timeUntilRotted
    /// @return The time until the plant is rotted in seconds
    function getTimeUntilRotted() external view returns (uint256){
        return _timeUntilRotted;
    }

    /// @dev Method to set the _timeUntilRotted for demonstration
    /// @param timeUntilRotted in seconds until the plant is rotted
    function setTimeUntilRotted(uint256 timeUntilRotted) external onlyOwner {
        _timeUntilRotted = timeUntilRotted;
    }

    /// @notice Check if a plant is rotted
    /// @param tokenId Id of the token to check
    /// @return A boolean if the plan is rotted
    function getIsRotted(uint256 tokenId) public view returns (bool) {
        uint256 timestamp = _details[tokenId].lastActionTimestamp;
        return _isTimerActive && timestamp != 0 ? timestamp + _timeUntilRotted < block.timestamp : false;
    }

    /// @notice Return Sum of all Tokens distrubuted
    /// @return Sum of all Tokens distrubuted
    function getDistributedTokens() external view returns (uint256) {
        return _distributedTokens;
    }

    /// @notice Return Tokens distrubuted for one wallet
    /// @return Tokens distrubuted for one wallet
    function getDistributedTokensOfAddress() external view returns (uint256) {
        return _distributedTokensPerWallet[msg.sender];
    }

    /// @notice Mints a Plant with start details
    function mint() public payable nonReentrant{
        require(msg.value == SELL_PRICE, "Funds sent are not correct");

        uint256 nextTokenId = totalSupply() + 1;

        Details memory newAttribute = Details({
            level: 0,
            harvestCounter: 0,
            wateringCounter: 0,
            lastActionTimestamp: 0,
            timestamp: block.timestamp,
            minter: msg.sender
        });

        _details[nextTokenId] = newAttribute;
        _safeMint(msg.sender, nextTokenId);
    }

    /// @notice Seeding a Plant to start playing
    /// @param tokenId Id of the token to seed
    function seed(uint256 tokenId) external payable {
        require(msg.sender == ownerOf(tokenId), "Sender is not owner of the plant");
        require(msg.value == SEEDING_PRICE, "Funds sent are not correct");
        require(_details[tokenId].level == 0, "Plant already seeded");

        _details[tokenId].level = 1;
        _details[tokenId].lastActionTimestamp = block.timestamp;
    }

    /// @notice Watering a Plant
    /// @param tokenId Id of the token to water
    function water(uint256 tokenId) external payable withinTimeSpan(tokenId) {
        require(msg.sender == ownerOf(tokenId), "Sender is not owner of the plant");
        require(msg.value == WATERING_PRICE, "Funds sent are not correct");
        require(_details[tokenId].level > 0, "Plant not seeded yet");
        require(_details[tokenId].wateringCounter < MAX_WATERING_COUNTER, "Plant is already ripe");
        require((_details[tokenId].level + _details[tokenId].harvestCounter) < MAX_HARVEST_LEVEL_COUNTER, "Plant reached full potential");

        _details[tokenId].wateringCounter += 1;
        _details[tokenId].lastActionTimestamp = block.timestamp;
    }

    /// @notice LevelUp a Plant
    /// @param tokenId Id of the token to levelUp
    function levelUp(uint256 tokenId) external withinTimeSpan(tokenId){
        require(msg.sender == ownerOf(tokenId), "Sender is not owner of the plant");
        require(_details[tokenId].wateringCounter == MAX_WATERING_COUNTER, "Plant is not ripe yet");

        _details[tokenId].wateringCounter = 0;
        _details[tokenId].level += 1;
        _details[tokenId].lastActionTimestamp = block.timestamp;
    }

    /// @notice harvest a Plant
    /// @param tokenId Id of the token to harvest
    function harvest(uint256 tokenId) external withinTimeSpan(tokenId){
        require(msg.sender == ownerOf(tokenId), "Sender is not owner of the plant");
        require(_details[tokenId].wateringCounter == MAX_WATERING_COUNTER, "Plant is not ripe yet");

        _details[tokenId].wateringCounter = 0;
        _details[tokenId].harvestCounter += 1;
        _details[tokenId].lastActionTimestamp = block.timestamp;

        uint8 level = _details[tokenId].level == 0  ? 1 : _details[tokenId].level;
        uint256 harvestForLevel = HARVEST_AMOUNT * LEVEL_FACTOR_PER_LEVEL[level-1] / 1000;

        _distributedTokens += harvestForLevel;
        _distributedTokensPerWallet[msg.sender] += harvestForLevel;
    }

    /// @notice Sells owned tokens and transfers funds to sender address
    /// @param tokenAmount Amount of tokens to be sold
    function sellTokens(uint256 tokenAmount) external payable {
        require(_distributedTokensPerWallet[msg.sender] >= tokenAmount, "Not enough tokens");

        uint256 tokenWorth = tokenAmount * calculateTokenPrice();
        //will throw on fail
        payable(msg.sender).transfer(tokenWorth);

        _distributedTokens -= tokenAmount;
        _distributedTokensPerWallet[msg.sender] -= tokenAmount;
    }

    /// @notice Calculates the token price based on the current and potential supply
    /// @return The price of a single token 
    function calculateTokenPrice() public view returns (uint256) {
        uint256 totalTokenSupplyPotential = calculateTotalTokenSupplyPotential();
        uint256 contractBalance = address(this).balance;

        uint256 tokenprice = totalTokenSupplyPotential == 0 ? 0 : contractBalance / (totalTokenSupplyPotential + _distributedTokens);

        return tokenprice;
    }

    /// @notice Calculates the potential harvest amount for all tokens
    /// @return The potential harvest amount of all plants if all future actions are harvest
    function calculateTotalTokenSupplyPotential() public view returns (uint256) {
        uint256 totaltokenSupply = 0;

        uint i;
        for (i=0; i < totalSupply(); i++){
            uint256 tokenId = tokenByIndex(i);
            totaltokenSupply += calculateTokenSupplyPotential(tokenId);
        }

        return totaltokenSupply;
    }

    /// @notice Calculates the potential harvest amount for single token
    /// @param tokenId Id of the token to harvest
    /// @return The potential harvest amount if all future actions are harvest
    function calculateTokenSupplyPotential(uint256 tokenId) public view returns (uint256) {
        uint8 level = _details[tokenId].level == 0  ? 1 : _details[tokenId].level;
        uint256 harvestPotential = getIsRotted(tokenId) ? 0 : MAX_HARVEST_LEVEL_COUNTER - level - _details[tokenId].harvestCounter;

        return HARVEST_AMOUNT * LEVEL_FACTOR_PER_LEVEL[level-1] * harvestPotential / 1000;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory){
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return IPlantDrawer(_plantContractAddress).tokenURI(this, tokenId);
    }
}
