// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "./interfaces/IGameObject.sol";

/// @title GameObject NFTs
/// @notice GameObject generated NFTs
contract GameObject is ERC721Enumerable, IGameObject, Ownable, ReentrancyGuard {
    /// @dev The address of the GameObjectDrawer Contract
    // address private immutable _gameObjectContractAddress; // ToDo: Change to land contract address

    /// @dev Price for one GameObject
    uint256 public constant SELL_PRICE = 0.02 ether;
    /// @dev Price for seeding a GameObject
    uint256 public constant SEEDING_PRICE = SELL_PRICE / 20;
    /// @dev Price for watering a GameObject
    uint256 public constant WATERING_PRICE = SELL_PRICE / 100;

    /// @dev Amount of how many times a GameObject needs watering before harvesting or levelup is possible
    uint8 public constant MAX_WATERING_COUNTER = 5;
    /// @dev Maximum actions on a GameObject
    uint8 public constant MAX_HARVEST_LEVEL_COUNTER = 5;
    /// @dev Amount that can be harvested with level 1
    uint8 public constant HARVEST_AMOUNT = 20;

    /// @dev The token ID GameObject details
    mapping(uint256 => Details) private _details;

    /// @dev Sum of all Tokens distrubuted
    uint256 private _distributedTokens;

    /// @dev Tokens distrubuted per wallet
    mapping(address => uint256) private _distributedTokensPerWallet;

    /// @dev Flag to enable/disable timer function for demonstration
    bool private _isTimerActive = true;
    
    /// @dev Time in seconds when next action(water/harvest/levelUp) on the GameObject is possible
    uint256 private _timeUntilNextAction = 60 * 60 * 6; // 6 hours
    /// @dev Time in seconds when GameObject dies without an action
    uint256 private _timeUntilRotted = 60 * 60 * 25; // 25 hours

    /// @dev Modifier to check if the next action is within the desired timespan
    modifier withinTimeSpan(uint256 tokenId) {
        uint256 timestamp = _details[tokenId].lastActionTimestamp;
        uint256 currentTimestamp = block.timestamp;
        if (_isTimerActive && timestamp != 0) {
            require(
                timestamp + _timeUntilNextAction < currentTimestamp,
                "too early for next action"
            );
            require(
                timestamp + _timeUntilRotted > currentTimestamp,
                "too late for next action"
            );
        }
        _;
    }

    /// @dev List of Factor per level times 1000
    uint256[] public LEVEL_FACTOR_PER_LEVEL = [1000, 1050, 1103, 1158, 1216];

    constructor(/*address plantContractAddress*/) ERC721("GameObject", "GAO") {
        // _gameObjectContractAddress = gameObjectContractAddress; // ToDo: Change to land contract address
    }

    /// @inheritdoc IGameObject
    function getDetails(uint256 tokenId)
        public
        view
        override
        returns (Details memory details)
    {
        details = _details[tokenId];
    }

    // /// @dev Method to get the timer for demonstration
    // /// @return The IsTimerActive boolean
    // function getIsTimerActive() external view returns (bool) {
    //     return _isTimerActive;
    // }

    /// @dev Method to enable/disable timer for demonstration
    /// @param active flag to enable disable timer
    function setIsTimerActive(bool active) external onlyOwner {
        _isTimerActive = active;
    }

    // /// @dev Method to get the _timeUntilNextAction
    // /// @return The time until next action in seconds
    // function getTimeUntilNextAction() external view returns (uint256) {
    //     return _timeUntilNextAction;
    // }

    /// @dev Method to set the _timeUntilNextAction for demonstration
    /// @param timeUntilNextAction in seconds until next action is allowed
    function setTimeUntilNextAction(uint256 timeUntilNextAction)
        external
        onlyOwner
    {
        _timeUntilNextAction = timeUntilNextAction;
    }

    /// @dev Method to get the _timeUntilRotted
    /// @return The time until the GameObject is rotted in seconds
    function getTimeUntilRotted() external view returns (uint256) {
        return _timeUntilRotted;
    }

    /// @dev Method to set the _timeUntilRotted for demonstration
    /// @param timeUntilRotted in seconds until the GameObject is rotted
    function setTimeUntilRotted(uint256 timeUntilRotted) external onlyOwner {
        _timeUntilRotted = timeUntilRotted;
    }

    /// @notice Check if a GameObject is rotted
    /// @param tokenId Id of the token to check
    /// @return A boolean if the plan is rotted
    function getIsRotted(uint256 tokenId) public view returns (bool) {
        uint256 timestamp = _details[tokenId].lastActionTimestamp;
        return
            _isTimerActive && timestamp != 0
                ? timestamp + _timeUntilRotted < block.timestamp
                : false;
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

    /// @notice Mints a GameObject with start details
    function mint() public payable nonReentrant {
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

    /// @notice Seeding a GameObject to start playing
    /// @param tokenId Id of the token to seed
    function seed(uint256 tokenId) external payable {
        require(
            msg.sender == ownerOf(tokenId),
            "Sender is not owner of the GameObject"
        );
        require(msg.value == SEEDING_PRICE, "Funds sent are not correct");
        require(_details[tokenId].level == 0, "GameObject already seeded");

        _details[tokenId].level = 1;
        _details[tokenId].lastActionTimestamp = block.timestamp;
    }

    /// @notice Watering a GameObject
    /// @param tokenId Id of the token to water
    function water(uint256 tokenId) external payable withinTimeSpan(tokenId) {
        require(
            msg.sender == ownerOf(tokenId),
            "Sender is not owner of the GameObject"
        );
        require(msg.value == WATERING_PRICE, "Funds sent are not correct");
        require(_details[tokenId].level > 0, "GameObject not seeded yet");
        require(
            _details[tokenId].wateringCounter < MAX_WATERING_COUNTER,
            "GameObject is already ripe"
        );
        require(
            (_details[tokenId].level + _details[tokenId].harvestCounter) <
                MAX_HARVEST_LEVEL_COUNTER,
            "GameObject reached full potential"
        );

        _details[tokenId].wateringCounter += 1;
        _details[tokenId].lastActionTimestamp = block.timestamp;
    }

    /// @notice LevelUp a GameObject
    /// @param tokenId Id of the token to levelUp
    function levelUp(uint256 tokenId) external withinTimeSpan(tokenId) {
        require(
            msg.sender == ownerOf(tokenId),
            "Sender is not owner of the GameObject"
        );
        require(
            _details[tokenId].wateringCounter == MAX_WATERING_COUNTER,
            "GameObject is not ripe yet"
        );

        _details[tokenId].wateringCounter = 0;
        _details[tokenId].level += 1;
        _details[tokenId].lastActionTimestamp = block.timestamp;
    }

    /// @notice harvest a GameObject
    /// @param tokenId Id of the token to harvest
    function harvest(uint256 tokenId) external withinTimeSpan(tokenId) {
        require(
            msg.sender == ownerOf(tokenId),
            "Sender is not owner of the GameObject"
        );
        require(
            _details[tokenId].wateringCounter == MAX_WATERING_COUNTER,
            "GameObject is not ripe yet"
        );

        _details[tokenId].wateringCounter = 0;
        _details[tokenId].harvestCounter += 1;
        _details[tokenId].lastActionTimestamp = block.timestamp;

        uint8 level = _details[tokenId].level == 0
            ? 1
            : _details[tokenId].level;
        uint256 harvestForLevel = (HARVEST_AMOUNT *
            LEVEL_FACTOR_PER_LEVEL[level - 1]) / 1000;

        _distributedTokens += harvestForLevel;
        _distributedTokensPerWallet[msg.sender] += harvestForLevel;
    }

    /// @notice Sells owned tokens and transfers funds to sender address
    /// @param tokenAmount Amount of tokens to be sold
    function sellTokens(uint256 tokenAmount) external payable {
        require(
            _distributedTokensPerWallet[msg.sender] >= tokenAmount,
            "Not enough tokens"
        );

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

        uint256 tokenprice = totalTokenSupplyPotential == 0
            ? 0
            : contractBalance /
                (totalTokenSupplyPotential + _distributedTokens);

        return tokenprice;
    }

    /// @notice Calculates the potential harvest amount for all tokens
    /// @return The potential harvest amount of all GameObjects if all future actions are harvest
    function calculateTotalTokenSupplyPotential()
        public
        view
        returns (uint256)
    {
        uint256 totaltokenSupply = 0;

        uint256 i;
        for (i = 0; i < totalSupply(); i++) {
            uint256 tokenId = tokenByIndex(i);
            totaltokenSupply += calculateTokenSupplyPotential(tokenId);
        }

        return totaltokenSupply;
    }

    /// @notice Calculates the potential harvest amount for single token
    /// @param tokenId Id of the token to harvest
    /// @return The potential harvest amount if all future actions are harvest
    function calculateTokenSupplyPotential(uint256 tokenId)
        public
        view
        returns (uint256)
    {
        uint8 level = _details[tokenId].level == 0
            ? 1
            : _details[tokenId].level;
        uint256 harvestPotential = getIsRotted(tokenId)
            ? 0
            : MAX_HARVEST_LEVEL_COUNTER -
                level -
                _details[tokenId].harvestCounter;

        return
            (HARVEST_AMOUNT *
                LEVEL_FACTOR_PER_LEVEL[level - 1] *
                harvestPotential) / 1000;
    }

    /// @dev generate Json Metadata name
    function generateName(uint256 tokenId)
        private
        pure
        returns (string memory)
    {
        return string(abi.encodePacked("Plant ", Strings.toString(tokenId)));
    }

    /// @dev generate Json Metadata description
    function generateDescription(address minter, uint256 timestamp)
        private
        pure
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    "Generated by ",
                    Strings.toHexString(uint256(uint160(minter))),
                    " at ",
                    Strings.toString(timestamp)
                )
            );
    }

    /// @dev generate Json Metadata attributes
    function generateAttributes(Details memory details)
        private
        pure
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    "[",
                    getJsonAttribute(
                        "Level",
                        Strings.toString(details.level),
                        false
                    ),
                    getJsonAttribute(
                        "HarvestCounter",
                        Strings.toString(details.harvestCounter),
                        true
                    ),
                    "]"
                )
            );
    }

    /// @dev Get the json attribute as
    ///    {
    ///      "trait_type": "Level",
    ///      "value": "22"
    ///    }
    function getJsonAttribute(
        string memory trait,
        string memory value,
        bool end
    ) private pure returns (string memory json) {
        return
            string(
                abi.encodePacked(
                    '{ "trait_type" : "',
                    trait,
                    '", "value" : "',
                    value,
                    '" }',
                    end ? "" : ","
                )
            );
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        Details memory details = getDetails(tokenId);

        string memory nameMetaData = generateName(tokenId);
        string memory description = generateDescription(
            details.minter,
            details.timestamp
        );
        string memory attributes = generateAttributes(details);

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        abi.encodePacked(
                            '{"name":"',
                            nameMetaData,
                            '", "description":"',
                            description,
                            '", "attributes":',
                            attributes,
                            ', "image": "',
                            "https://dummyurl.com",
                            '"}'
                        )
                    )
                )
            );
    }
}
