# Solidity API

## Plant

Plant generated NFTs

### _plantContractAddress

```solidity
address _plantContractAddress
```

_The address of the plantDrawer Contract_

### SELL_PRICE

```solidity
uint256 SELL_PRICE
```

_Price for one Plant_

### SEEDING_PRICE

```solidity
uint256 SEEDING_PRICE
```

_Price for seeding a Plant_

### WATERING_PRICE

```solidity
uint256 WATERING_PRICE
```

_Price for watering a Plant_

### MAX_WATERING_COUNTER

```solidity
uint8 MAX_WATERING_COUNTER
```

_Amount of how many times a plant needs watering befor harvesting or levelup is possible_

### MAX_HARVEST_LEVEL_COUNTER

```solidity
uint8 MAX_HARVEST_LEVEL_COUNTER
```

_Maximum actions on a plant_

### HARVEST_AMOUNT

```solidity
uint8 HARVEST_AMOUNT
```

_Amount that can be harvested with level 1 and healthyness 100%_

### _details

```solidity
mapping(uint256 &#x3D;&gt; struct IPlant.Details) _details
```

_The token ID plant details_

### _distributedTokens

```solidity
uint256 _distributedTokens
```

_Sum of all Tokens distrubuted_

### _distributedTokensPerWallet

```solidity
mapping(address &#x3D;&gt; uint256) _distributedTokensPerWallet
```

_Tokens distrubuted per wallet_

### _isTimerActive

```solidity
bool _isTimerActive
```

_Flag to enable/disable timer function for demonstration_

### _timeUntilNextAction

```solidity
uint256 _timeUntilNextAction
```

_Time in seconds when next action(water/harvest/levelUp) on the plant is possible_

### _timeUntilRotted

```solidity
uint256 _timeUntilRotted
```

_Time in seconds when plant dies without an action_

### withinTimeSpan

```solidity
modifier withinTimeSpan(uint256 tokenId)
```

_Modifier to check if the next action is within the desired timespan_

### LEVEL_FACTOR_PER_LEVEL

```solidity
uint256[] LEVEL_FACTOR_PER_LEVEL
```

_List of Factor per level times 1000_

### constructor

```solidity
constructor(address plantContractAddress) public
```

### getDetails

```solidity
function getDetails(uint256 tokenId) public view returns (struct IPlant.Details details)
```

Returns the details associated with a given token ID.

_Throws if the token ID is not valid._

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the token that represents the Plant |

| Name | Type | Description |
| ---- | ---- | ----------- |
| details | struct IPlant.Details | memory |

### getIsTimerActive

```solidity
function getIsTimerActive() external view returns (bool)
```

_Method to get the timer for demonstration_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | The IsTimerActive boolean |

### setIsTimerActive

```solidity
function setIsTimerActive(bool active) external
```

_Method to enable/disable timer for demonstration_

| Name | Type | Description |
| ---- | ---- | ----------- |
| active | bool | flag to enable disable timer |

### getTimeUntilNextAction

```solidity
function getTimeUntilNextAction() external view returns (uint256)
```

_Method to get the _timeUntilNextAction_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The time until next action in seconds |

### setTimeUntilNextAction

```solidity
function setTimeUntilNextAction(uint256 timeUntilNextAction) external
```

_Method to set the _timeUntilNextAction for demonstration_

| Name | Type | Description |
| ---- | ---- | ----------- |
| timeUntilNextAction | uint256 | in seconds until next action is allowed |

### getTimeUntilRotted

```solidity
function getTimeUntilRotted() external view returns (uint256)
```

_Method to get the _timeUntilRotted_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The time until the plant is rotted in seconds |

### setTimeUntilRotted

```solidity
function setTimeUntilRotted(uint256 timeUntilRotted) external
```

_Method to set the _timeUntilRotted for demonstration_

| Name | Type | Description |
| ---- | ---- | ----------- |
| timeUntilRotted | uint256 | in seconds until the plant is rotted |

### getIsRotted

```solidity
function getIsRotted(uint256 tokenId) public view returns (bool)
```

Check if a plant is rotted

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | Id of the token to check |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean if the plan is rotted |

### getDistributedTokens

```solidity
function getDistributedTokens() external view returns (uint256)
```

Return Sum of all Tokens distrubuted

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Sum of all Tokens distrubuted |

### getDistributedTokensOfAddress

```solidity
function getDistributedTokensOfAddress() external view returns (uint256)
```

Return Tokens distrubuted for one wallet

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Tokens distrubuted for one wallet |

### mint

```solidity
function mint() public payable
```

Mints a Plant with start details

### seed

```solidity
function seed(uint256 tokenId) external payable
```

Seeding a Plant to start playing

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | Id of the token to seed |

### water

```solidity
function water(uint256 tokenId) external payable
```

Watering a Plant

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | Id of the token to water |

### levelUp

```solidity
function levelUp(uint256 tokenId) external
```

LevelUp a Plant

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | Id of the token to levelUp |

### harvest

```solidity
function harvest(uint256 tokenId) external
```

harvest a Plant

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | Id of the token to harvest |

### sellTokens

```solidity
function sellTokens(uint256 tokenAmount) external payable
```

Sells owned tokens and transfers funds to sender address

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAmount | uint256 | Amount of tokens to be sold |

### calculateTokenPrice

```solidity
function calculateTokenPrice() public view returns (uint256)
```

Calculates the token price based on the current and potential supply

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The price of a single token |

### calculateTotalTokenSupplyPotential

```solidity
function calculateTotalTokenSupplyPotential() public view returns (uint256)
```

Calculates the potential harvest amount for all tokens

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The potential harvest amount of all plants if all future actions are harvest |

### calculateTokenSupplyPotential

```solidity
function calculateTokenSupplyPotential(uint256 tokenId) public view returns (uint256)
```

Calculates the potential harvest amount for single token

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | Id of the token to harvest |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The potential harvest amount if all future actions are harvest |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) public view returns (string)
```

_See {IERC721Metadata-tokenURI}._

## PlantDrawer

Produces a string containing the data URI for a JSON metadata string

### tokenURI

```solidity
function tokenURI(contract IPlant plant, uint256 tokenId) public view returns (string)
```

Produces the URI describing a particular Plant (token id)

_Note this URI may be a data: URI with the JSON contents directly inlined_

| Name | Type | Description |
| ---- | ---- | ----------- |
| plant | contract IPlant | The Plant contract |
| tokenId | uint256 | The ID of the token for which to produce a description |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | The URI of the ERC721-compliant metadata |

### generateName

```solidity
function generateName(uint256 tokenId) private pure returns (string)
```

_generate Json Metadata name_

### generateDescription

```solidity
function generateDescription(address minter, uint256 timestamp) private pure returns (string)
```

_generate Json Metadata description_

### generateAttributes

```solidity
function generateAttributes(struct IPlant.Details details) private pure returns (string)
```

_generate Json Metadata attributes_

### getJsonAttribute

```solidity
function getJsonAttribute(string trait, string value, bool end) private pure returns (string json)
```

_Get the json attribute as
   {
     &quot;trait_type&quot;: &quot;Level&quot;,
     &quot;value&quot;: &quot;22&quot;
   }_

### generateSVGImage

```solidity
function generateSVGImage(struct IPlant.Details details) private pure returns (string)
```

_Combine all the SVGs to generate the final image_

### generateSVGHead

```solidity
function generateSVGHead() private pure returns (string)
```

_generate SVG header_

### generatePlant

```solidity
function generatePlant(struct IPlant.Details details) private pure returns (string)
```

_generate SVG plant_

### generatePot

```solidity
function generatePot() private pure returns (string)
```

_generate SVG pot_

## IPlant

### Details

```solidity
struct Details {
  uint8 level;
  uint8 harvestCounter;
  uint8 wateringCounter;
  uint256 lastActionTimestamp;
  uint256 timestamp;
  address minter;
}
```

### getDetails

```solidity
function getDetails(uint256 tokenId) external view returns (struct IPlant.Details details)
```

Returns the details associated with a given token ID.

_Throws if the token ID is not valid._

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the token that represents the Plant |

| Name | Type | Description |
| ---- | ---- | ----------- |
| details | struct IPlant.Details | memory |

## IPlantDrawer

### tokenURI

```solidity
function tokenURI(contract IPlant plant, uint256 tokenId) external view returns (string)
```

Produces the URI describing a particular Plant (token id)

_Note this URI may be a data: URI with the JSON contents directly inlined_

| Name | Type | Description |
| ---- | ---- | ----------- |
| plant | contract IPlant | The Plant contract |
| tokenId | uint256 | The ID of the token for which to produce a description |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | The URI of the ERC721-compliant metadata |

