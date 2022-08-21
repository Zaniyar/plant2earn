/* eslint-disable prettier/prettier */
import { expect } from "chai";
import { ethers } from "hardhat";
import { beforeEach } from "mocha";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Plant } from "../typechain";
import { BigNumber } from "ethers";
import { XmlDocument } from "xmldoc";

export interface Attribute {
    // eslint-disable-next-line camelcase
    trait_type: string;
    value: string;
}

export interface ITokenURI {
    name: string;
    description: string;
    attributes: Attribute[];
    image: string;
}

describe("Plant", () => {
    let plantContract: Plant;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    let sellPrice: BigNumber;
    let seedingPrice: BigNumber;
    let wateringPrice: BigNumber;
    let maxWaterCounter: number;
    let maxHarvestLevelCounter: number;
    let harvestAmount: number;

    const levelFactor: number = 1.05;

    beforeEach(async () => {
        const PlantDrawer = await ethers.getContractFactory("PlantDrawer");
        const plantDrawerContract = await PlantDrawer.deploy();

        [owner, addr1, addr2] = await ethers.getSigners();

        const Plant = await ethers.getContractFactory("Plant");
        plantContract = await Plant.deploy(plantDrawerContract.address);
        await plantContract.setIsTimerActive(false);

        sellPrice = await plantContract.SELL_PRICE().then((number) => number);
        seedingPrice = await plantContract.SEEDING_PRICE().then((number) => number);
        wateringPrice = await plantContract.WATERING_PRICE().then((number) => number);

        maxWaterCounter = await plantContract.MAX_WATERING_COUNTER().then((number) => number);
        maxHarvestLevelCounter = await plantContract.MAX_HARVEST_LEVEL_COUNTER().then((number) => number);
        harvestAmount = await plantContract.HARVEST_AMOUNT().then((number) => number);
    });

    describe("Contract", function () {
        it("Should initialize Plant contract", async () => {
            expect(await plantContract.name()).to.equal("Plant");
        });

        it("Should set the right owner", async () => {
            expect(await plantContract.owner()).to.equal(await owner.address);
        });

        it("Should have balance 0", async () => {
            expect(await plantContract.provider.getBalance(plantContract.address)).to.equal(0);
        })
    });

    describe("Mint", function () {
        it("Should mint a plant with correct price", async () => {
            await plantContract.connect(addr1).mint({ value: sellPrice })
            expect(await plantContract.balanceOf(addr1.address)).to.equal(1);
        });
        it("Should fail mint a plant with wrong price", async () => {
            await expect(
                plantContract.connect(addr1).mint({ value: 999 })
            ).to.be.revertedWith("Funds sent are not correct");
            expect(await plantContract.balanceOf(addr1.address)).to.equal(0);
        });
    });

    describe("Gardening", function () {
        let tokenId: BigNumber;

        beforeEach(async () => {
            await plantContract.connect(addr1).mint({ value: sellPrice });
            tokenId = await plantContract.tokenOfOwnerByIndex(addr1.address, 0);
        });

        describe("Seeding", function () {
            it("Should seed not yet seeded plant with correct price", async () => {
                await plantContract.connect(addr1).seed(tokenId, { value: seedingPrice });
                const details = await plantContract.connect(addr1).getDetails(tokenId);
                expect(details.level).to.equal(1);
            });

            it("Should fail seed plant when not owner of token", async () => {
                await expect(
                    plantContract.connect(addr2).seed(tokenId, { value: seedingPrice })
                ).to.be.revertedWith("Sender is not owner of the plant");
            });

            it("Should fail seed plant when seeding with wrong price", async () => {
                await expect(
                    plantContract.connect(addr1).seed(tokenId, { value: 999 })
                ).to.be.revertedWith("Funds sent are not correct");
            });


            it("Should fail seed plant when already seeded", async () => {
                await plantContract.connect(addr1).seed(tokenId, { value: seedingPrice });

                await expect(
                    plantContract.connect(addr1).seed(tokenId, { value: seedingPrice })
                ).to.be.revertedWith("Plant already seeded");
            });

            it(`"Should have balance of minting once"`, async () => {
                expect(await plantContract.provider.getBalance(plantContract.address)).to.equal(sellPrice);
            })
        });

        describe("Watering", function () {

            beforeEach(async () => {
                await plantContract.connect(addr1).seed(tokenId, { value: seedingPrice });
            });

            it("Should water plant with correct price", async () => {
                await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                const details = await plantContract.connect(addr1).getDetails(tokenId);
                expect(details.wateringCounter).to.equal(1);
            });

            it("Should fail water plant when not owner of token", async () => {
                await expect(
                    plantContract.connect(addr2).water(tokenId, { value: wateringPrice })
                ).to.be.revertedWith("Sender is not owner of the plant");
            });

            it("Should fail water plant when watering with wrong price", async () => {
                await expect(
                    plantContract.connect(addr1).water(tokenId, { value: 999 })
                ).to.be.revertedWith("Funds sent are not correct");
            });

            it("Should fail watering plant when not seeded", async () => {
                await plantContract.connect(addr1).mint({ value: sellPrice });
                tokenId = await plantContract.tokenOfOwnerByIndex(addr1.address, 1);

                await expect(
                    plantContract.connect(addr1).water(tokenId, { value: wateringPrice })
                ).to.be.revertedWith("Plant not seeded yet");
            });

            it(`Should water plant maxWaterCounter times `, async () => {
                for (let i = 0; i < maxWaterCounter; i++) {
                    await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                }
                const details = await plantContract.connect(addr1).getDetails(tokenId);
                expect(details.wateringCounter).to.equal(10);
            });

            it(`Should fail water plant reached maxWaterCounter`, async () => {
                for (let i = 0; i < maxWaterCounter; i++) {
                    await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                }

                await expect(
                    plantContract.connect(addr1).water(tokenId, { value: wateringPrice })
                ).to.be.revertedWith("Plant is already ripe");
            });

            it("Should fail water plant when reached maxHarvestLevelCounter", async () => {
                for (let i = 1; i < maxHarvestLevelCounter; i++) {
                    for (let j = 0; j < maxWaterCounter; j++) {
                        await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                    }
                    await plantContract.connect(addr1).levelUp(tokenId)
                }

                await expect(
                    plantContract.connect(addr1).water(tokenId, { value: wateringPrice })
                ).to.be.revertedWith("Plant reached full potential");
            });

            it(`"Should have balance of minting and seeding once"`, async () => {
                expect(await plantContract.provider.getBalance(plantContract.address)).to.equal(sellPrice.add(seedingPrice));
            })
        });
        describe("LevelUp", function () {

            beforeEach(async () => {
                await plantContract.connect(addr1).seed(tokenId, { value: seedingPrice });
                for (let i = 0; i < maxWaterCounter; i++) {
                    await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                }
            });

            it("Should levelup plant when it is ripe", async () => {
                await plantContract.connect(addr1).levelUp(tokenId);
                const details = await plantContract.connect(addr1).getDetails(tokenId);
                expect(details.level).to.equal(2);
                expect(details.wateringCounter).to.equal(0);
            });

            it("Should fail levelup plant when not owner of token", async () => {
                await expect(
                    plantContract.connect(addr2).levelUp(tokenId)
                ).to.be.revertedWith("Sender is not owner of the plant");
            });

            it("Should fail levelup plant when not ripe", async () => {
                await plantContract.connect(addr1).mint({ value: sellPrice });
                tokenId = await plantContract.tokenOfOwnerByIndex(addr1.address, 1);

                await expect(
                    plantContract.connect(addr1).levelUp(tokenId)
                ).to.be.revertedWith("Plant is not ripe yet");
            });

            it("Should levelup plant maxHarvestLevelCounter times", async () => {
                for (let i = 1; i < maxHarvestLevelCounter; i++) {
                    await plantContract.connect(addr1).levelUp(tokenId)
                    if (i !== maxHarvestLevelCounter - 1) {
                        for (let j = 0; j < maxWaterCounter; j++) {
                            await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                        }
                    }
                }

                const details = await plantContract.connect(addr1).getDetails(tokenId);
                expect(details.level + details.harvestCounter).to.equal(maxHarvestLevelCounter);
            });
        });
        describe("Harvest", function () {

            beforeEach(async () => {
                await plantContract.connect(addr1).seed(tokenId, { value: seedingPrice });
                for (let i = 0; i < maxWaterCounter; i++) {
                    await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                }
            });

            it("Should harvest plant when it is ripe", async () => {
                await plantContract.connect(addr1).harvest(tokenId);
                const details = await plantContract.connect(addr1).getDetails(tokenId);
                expect(details.harvestCounter).to.equal(1);
                expect(details.wateringCounter).to.equal(0);
                expect(await plantContract.connect(addr1).getDistributedTokens()).to.equal(harvestAmount);
                expect(await plantContract.connect(addr1).getDistributedTokensOfAddress()).to.equal(harvestAmount);
            });

            it("Should fail harvest plant when not owner of token", async () => {
                await expect(
                    plantContract.connect(addr2).harvest(tokenId)
                ).to.be.revertedWith("Sender is not owner of the plant");
            });

            it("Should fail harvest plant when not ripe", async () => {
                await plantContract.connect(addr1).mint({ value: sellPrice });
                tokenId = await plantContract.tokenOfOwnerByIndex(addr1.address, 1);

                await expect(
                    plantContract.connect(addr1).harvest(tokenId)
                ).to.be.revertedWith("Plant is not ripe yet");
            });

            it("Should harvest plant maxHarvestLevelCounter times", async () => {
                for (let i = 1; i < maxHarvestLevelCounter; i++) {
                    plantContract.connect(addr1).harvest(tokenId)
                    if (i !== maxHarvestLevelCounter - 1) {
                        for (let j = 0; j < maxWaterCounter; j++) {
                            await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                        }
                    }
                }

                const details = await plantContract.connect(addr1).getDetails(tokenId);
                expect(details.level + details.harvestCounter).to.equal(maxHarvestLevelCounter);
                expect(await plantContract.connect(addr1).getDistributedTokens()).to.equal(harvestAmount * (maxHarvestLevelCounter - 1));
                expect(await plantContract.connect(addr1).getDistributedTokensOfAddress()).to.equal(harvestAmount * (maxHarvestLevelCounter - 1));
            });
        });
    });

    describe("TokenPotential", function () {
        let tokenId: BigNumber;

        it("Should have no token potential when no nft is minted", async () => {
            const mintedTokenAmount = 0;
            const shouldTotalTokenPotential = mintedTokenAmount * harvestAmount * (maxHarvestLevelCounter - 1);
            expect(await plantContract.calculateTotalTokenSupplyPotential()).to.equal(shouldTotalTokenPotential);

        });

        describe("After mint one token", function () {
            beforeEach(async () => {
                await plantContract.connect(addr1).mint({ value: sellPrice });
                tokenId = await plantContract.tokenOfOwnerByIndex(addr1.address, 0);
            });

            it("contract Should have total potential of harvestAmount * maxHarvestCounter", async () => {
                const mintedTokenAmount = 1;
                const shouldTotalTokenPotential = mintedTokenAmount * harvestAmount * (maxHarvestLevelCounter - 1);
                const tokenPotential = await plantContract.calculateTotalTokenSupplyPotential();
                expect(tokenPotential.toNumber()).to.equal(shouldTotalTokenPotential);
            });

            it("Token Should have potential of harvestAmount * maxHarvestCounter", async () => {
                const mintedTokenAmount = 1;
                const shouldTokenPotential = mintedTokenAmount * harvestAmount * (maxHarvestLevelCounter - 1);
                const tokenPotential = await plantContract.calculateTokenSupplyPotential(tokenId);
                expect(tokenPotential.toNumber()).to.equal(shouldTokenPotential);
            });

            describe("After level up one token to level 2", function () {
                beforeEach(async () => {
                    await plantContract.connect(addr1).seed(tokenId, { value: seedingPrice });
                    for (let i = 0; i < maxWaterCounter; i++) {
                        await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                    }
                    await plantContract.connect(addr1).levelUp(tokenId);
                });

                it("Contract Should have total potential of harvestAmount * harvestingLeft * level ^ levelFactor", async () => {
                    const mintedTokenAmount = 1;
                    const shouldTotalTokenPotential = mintedTokenAmount * harvestAmount * (maxHarvestLevelCounter - 2) * levelFactor;
                    const tokenPotential = await plantContract.calculateTotalTokenSupplyPotential();
                    expect(tokenPotential.toNumber()).to.equal(shouldTotalTokenPotential);
                });

                it("Token Should have potential of harvestAmount * harvestingLeft * levelFactor", async () => {
                    const mintedTokenAmount = 1;
                    const shouldTokenPotential = mintedTokenAmount * harvestAmount * (maxHarvestLevelCounter - 2) * levelFactor;
                    const tokenPotential = await plantContract.calculateTokenSupplyPotential(tokenId);
                    expect(tokenPotential.toNumber()).to.equal(shouldTokenPotential);
                });
            });

            describe("After level up one token to level 3", function () {
                let toLevel: number;
                beforeEach(async () => {
                    await plantContract.connect(addr1).seed(tokenId, { value: seedingPrice });
                    toLevel = 3;

                    for (let i = 1; i < toLevel; i++) {
                        for (let j = 0; j < maxWaterCounter; j++) {
                            await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                        }
                        await plantContract.connect(addr1).levelUp(tokenId)
                    }
                });

                it("Contract Should have total potential of harvestAmount * harvestingLeft * level ^ levelFactor", async () => {
                    const mintedTokenAmount = 1;

                    const shouldTotalTokenPotential = mintedTokenAmount * harvestAmount * (maxHarvestLevelCounter - toLevel) * Math.pow(levelFactor, toLevel - 1);
                    const tokenPotential = await plantContract.calculateTotalTokenSupplyPotential();
                    expect(tokenPotential.toNumber()).to.equal(Math.floor(shouldTotalTokenPotential));
                });

                it("Token Should have potential of harvestAmount * harvestingLeft * level ^ levelFactor", async () => {
                    const mintedTokenAmount = 1;
                    const shouldTokenPotential = mintedTokenAmount * harvestAmount * (maxHarvestLevelCounter - toLevel) * Math.pow(levelFactor, toLevel - 1);
                    const tokenPotential = await plantContract.calculateTokenSupplyPotential(tokenId);
                    expect(tokenPotential.toNumber()).to.equal(Math.floor(shouldTokenPotential));
                });
            });

            describe("After level up one token to level 30", function () {
                let toLevel: number;
                beforeEach(async () => {
                    await plantContract.connect(addr1).seed(tokenId, { value: seedingPrice });
                    toLevel = 30;

                    for (let i = 1; i < toLevel; i++) {
                        for (let j = 0; j < maxWaterCounter; j++) {
                            await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                        }
                        await plantContract.connect(addr1).levelUp(tokenId)
                    }
                });

                it("Contract Should have total potential of harvestAmount * harvestingLeft * level ^ levelFactor", async () => {
                    const mintedTokenAmount = 1;
                    const shouldTotalTokenPotential = mintedTokenAmount * harvestAmount * (maxHarvestLevelCounter - toLevel) * Math.pow(levelFactor, toLevel - 1);
                    const tokenPotential = await plantContract.calculateTotalTokenSupplyPotential();
                    expect(tokenPotential.toNumber()).to.equal(Math.floor(shouldTotalTokenPotential));
                });

                it("Token Should have potential of harvestAmount * maxHarvestCounter * level ^ levelFactor", async () => {
                    const mintedTokenAmount = 1;
                    const shouldTokenPotential = mintedTokenAmount * harvestAmount * (maxHarvestLevelCounter - toLevel) * Math.pow(levelFactor, toLevel - 1);
                    const tokenPotential = await plantContract.calculateTokenSupplyPotential(tokenId);
                    expect(tokenPotential.toNumber()).to.equal(Math.floor(shouldTokenPotential));
                });
            });

            describe("After level up one token to level maxHarvestLevelCounter", function () {
                beforeEach(async () => {
                    await plantContract.connect(addr1).seed(tokenId, { value: seedingPrice });

                    for (let i = 1; i < maxHarvestLevelCounter; i++) {
                        for (let j = 0; j < maxWaterCounter; j++) {
                            await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                        }
                        await plantContract.connect(addr1).levelUp(tokenId)
                    }
                });

                it("Contract Should have total potential of 0", async () => {
                    const shouldTotalTokenPotential = 0;
                    const tokenPotential = await plantContract.calculateTotalTokenSupplyPotential();
                    expect(tokenPotential.toNumber()).to.equal(Math.floor(shouldTotalTokenPotential));
                });

                it("Token Should have potential of 0", async () => {
                    const shouldTokenPotential = 0;
                    const tokenPotential = await plantContract.calculateTokenSupplyPotential(tokenId);
                    expect(tokenPotential.toNumber()).to.equal(shouldTokenPotential);
                });
            });
        });

        describe("After mint 100 token", function () {
            beforeEach(async () => {
                for (let i = 0; i < 100; i++) {
                    await plantContract.connect(addr1).mint({ value: sellPrice });
                }
                tokenId = await plantContract.tokenOfOwnerByIndex(addr1.address, 0);
            });

            it("contract Should have total potential of harvestAmount * maxHarvestCounter", async () => {
                const mintedTokenAmount = 100;
                const shouldTotalTokenPotential = mintedTokenAmount * harvestAmount * (maxHarvestLevelCounter - 1);
                const tokenPotential = await plantContract.calculateTotalTokenSupplyPotential();
                expect(tokenPotential.toNumber()).to.equal(shouldTotalTokenPotential);
            });

            it("Token Should have potential of harvestAmount * maxHarvestCounter", async () => {
                const mintedTokenAmount = 1;
                const shouldTokenPotential = mintedTokenAmount * harvestAmount * (maxHarvestLevelCounter - 1);
                const tokenPotential = await plantContract.calculateTokenSupplyPotential(tokenId);
                expect(tokenPotential.toNumber()).to.equal(shouldTokenPotential);
            });

            describe("After level up 100 token to level 2", function () {
                beforeEach(async () => {
                    for (let i = 1; i <= 100; i++) {
                        await plantContract.connect(addr1).seed(i, { value: seedingPrice });
                        for (let j = 0; j < maxWaterCounter; j++) {
                            await plantContract.connect(addr1).water(i, { value: wateringPrice });
                        }
                        await plantContract.connect(addr1).levelUp(i);
                    }
                });

                it("Contract Should have total potential of harvestAmount * harvestingLeft * level ^ levelFactor", async () => {
                    const mintedTokenAmount = 100;
                    const shouldTotalTokenPotential = mintedTokenAmount * Math.floor(harvestAmount * (maxHarvestLevelCounter - 2) * levelFactor);
                    const tokenPotential = await plantContract.calculateTotalTokenSupplyPotential();
                    expect(tokenPotential.toNumber()).to.equal(shouldTotalTokenPotential);
                });

                it("Token Should have potential of harvestAmount * harvestingLeft * levelFactor", async () => {
                    const mintedTokenAmount = 1;
                    const shouldTokenPotential = mintedTokenAmount * harvestAmount * (maxHarvestLevelCounter - 2) * levelFactor;
                    const tokenPotential = await plantContract.calculateTokenSupplyPotential(tokenId);
                    expect(tokenPotential.toNumber()).to.equal(shouldTokenPotential);
                });
            });

            describe("After level up hundred token to level 3", function () {
                let toLevel: number;
                beforeEach(async () => {
                    toLevel = 3;

                    for (let i = 1; i <= 100; i++) {
                        await plantContract.connect(addr1).seed(i, { value: seedingPrice });

                        for (let x = 1; x < toLevel; x++) {
                            for (let j = 0; j < maxWaterCounter; j++) {
                                await plantContract.connect(addr1).water(i, { value: wateringPrice });
                            }
                            await plantContract.connect(addr1).levelUp(i);
                        }
                    }
                });

                it("Contract Should have total potential of harvestAmount * harvestingLeft * level ^ levelFactor", async () => {
                    const mintedTokenAmount = 100;

                    const shouldTotalTokenPotential = mintedTokenAmount * Math.floor(harvestAmount * (maxHarvestLevelCounter - toLevel) * Math.pow(levelFactor, toLevel - 1));
                    const tokenPotential = await plantContract.calculateTotalTokenSupplyPotential();
                    expect(tokenPotential.toNumber()).to.equal(Math.floor(shouldTotalTokenPotential));
                });

                it("Token Should have potential of harvestAmount * harvestingLeft * level ^ levelFactor", async () => {
                    const mintedTokenAmount = 1;
                    const shouldTokenPotential = mintedTokenAmount * harvestAmount * (maxHarvestLevelCounter - toLevel) * Math.pow(levelFactor, toLevel - 1);
                    const tokenPotential = await plantContract.calculateTokenSupplyPotential(tokenId);
                    expect(tokenPotential.toNumber()).to.equal(Math.floor(shouldTokenPotential));
                });
            });
        });
    });


    describe("Sell Token", function () {
        let tokenId: BigNumber;
        beforeEach(async () => {
            await plantContract.connect(addr1).mint({ value: sellPrice });
            tokenId = await plantContract.tokenOfOwnerByIndex(addr1.address, 0);
            await plantContract.connect(addr1).seed(tokenId, { value: seedingPrice });
            for (let i = 0; i < maxWaterCounter; i++) {
                await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
            }
            await plantContract.connect(addr1).harvest(tokenId);
        });

        it("Should sell harvested tokens", async () => {
            const tokenAmount = BigNumber.from(20);
            const initialContractTokenAmount = await plantContract.connect(addr1).getDistributedTokens();
            const initialAddressTokenAmount = await plantContract.connect(addr1).getDistributedTokensOfAddress();
            const initialAddressBalance = await addr1.getBalance();

            const tokenPrice = await plantContract.calculateTokenPrice()

            const tx = await plantContract.connect(addr1).sellTokens(tokenAmount);
            const receipt = await tx.wait();
            const txCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);

            const afterSellContractTokenAmount = await plantContract.getDistributedTokens();
            const afterSellAddressTokenAmount = await plantContract.getDistributedTokensOfAddress();
            const afterSellAddressBalance = await addr1.getBalance();

            expect(initialContractTokenAmount.sub(tokenAmount)).to.equal(afterSellContractTokenAmount)
            expect(initialAddressTokenAmount.sub(tokenAmount)).to.equal(afterSellAddressTokenAmount)
            expect(initialAddressBalance.add(tokenPrice.mul(tokenAmount).sub(txCost))).to.equal(afterSellAddressBalance)
        });


        it("Should fail to sell tokens with insufficient amount", async function () {
            const tokenAmount = 21;
            await expect(
                plantContract.connect(addr1).sellTokens(tokenAmount)
            ).to.be.revertedWith("Not enough tokens");
        });

        it("Should fail to sell tokens with insufficient amount", async function () {
            const tokenAmount = 20;
            await expect(
                plantContract.connect(addr2).sellTokens(tokenAmount)
            ).to.be.revertedWith("Not enough tokens");
        });
    });

    describe("TokenPrice", function () {
        it("Should have no token price when no nft is minted", async () => {
            const mintedTokenAmount: BigNumber = BigNumber.from("0")

            const shouldTokenPrice = mintedTokenAmount.mul(sellPrice);
            expect(await plantContract.calculateTokenPrice()).to.equal(shouldTokenPrice);
        });

        it("Should have token price after mint one token", async function () {
            await plantContract.connect(addr1).mint({ value: sellPrice });
            const totalTokenSupplyPotential = await plantContract.calculateTotalTokenSupplyPotential();

            const mintedTokenAmount: BigNumber = BigNumber.from("1")
            const shouldTokenPrice = mintedTokenAmount.mul(sellPrice).div(totalTokenSupplyPotential);

            expect(await plantContract.calculateTokenPrice()).to.equal(shouldTokenPrice);
        });
    });

    describe("Timing", function () {
        let nextActionTime: BigNumber;
        let rottingTime: BigNumber;
        let tokenId: BigNumber;

        beforeEach(async () => {
            nextActionTime = await plantContract.getTimeUntilNextAction();
            rottingTime = await plantContract.getTimeUntilRotted();

            await plantContract.connect(addr1).mint({ value: sellPrice });
            tokenId = await plantContract.tokenOfOwnerByIndex(addr1.address, 0);
            await plantContract.connect(addr1).seed(tokenId, { value: seedingPrice });
        });
        describe("Watering", function () {

            beforeEach(async () => {
                await plantContract.setIsTimerActive(true);
            });

            it("Should not allow watering just after seeding", async () => {
                await expect(plantContract.connect(addr1).water(tokenId, { value: wateringPrice })).to.be.revertedWith("too early for next action");
            });

            it("Should allow watering after getTimeUntilNextAction seeding", async () => {
                await ethers.provider.send('evm_increaseTime', [nextActionTime.add(BigNumber.from(1)).toNumber()]);
                await ethers.provider.send('evm_mine', []);

                await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                const details = await plantContract.connect(addr1).getDetails(tokenId);
                expect(details.wateringCounter).to.equal(1);
            });

            it("Should not allow watering rotted plant", async () => {
                await ethers.provider.send('evm_increaseTime', [rottingTime.add(BigNumber.from(1)).toNumber()]);
                await ethers.provider.send('evm_mine', []);

                await expect(plantContract.connect(addr1).water(tokenId, { value: wateringPrice })).to.be.revertedWith("too late for next action");
            });
        });

        describe("Levelup", function () {

            beforeEach(async () => {
                for (let i = 0; i < maxWaterCounter; i++) {
                    await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                }
                await plantContract.setIsTimerActive(true);
            });

            it("Should not allow harvesting just after watering", async () => {
                await expect(plantContract.connect(addr1).levelUp(tokenId)).to.be.revertedWith("too early for next action");
            });

            it("Should allow harvesting after getTimeUntilNextAction seeding", async () => {
                await ethers.provider.send('evm_increaseTime', [nextActionTime.add(BigNumber.from(1)).toNumber()]);
                await ethers.provider.send('evm_mine', []);

                await plantContract.connect(addr1).levelUp(tokenId);
                const details = await plantContract.connect(addr1).getDetails(tokenId);
                expect(details.level).to.equal(2);
                expect(details.wateringCounter).to.equal(0);
            });

            it("Should not allow harvesting rotted plant", async () => {
                await ethers.provider.send('evm_increaseTime', [rottingTime.add(BigNumber.from(1)).toNumber()]);
                await ethers.provider.send('evm_mine', []);

                await expect(plantContract.connect(addr1).levelUp(tokenId)).to.be.revertedWith("too late for next action");
            });
        });


        describe("Harvesting", function () {
            beforeEach(async () => {
                for (let i = 0; i < maxWaterCounter; i++) {
                    await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                }
                await plantContract.setIsTimerActive(true);
            });

            it("Should not allow harvesting just after watering", async () => {
                await expect(plantContract.connect(addr1).harvest(tokenId)).to.be.revertedWith("too early for next action");
            });

            it("Should allow harvesting after getTimeUntilNextAction seeding", async () => {
                await ethers.provider.send('evm_increaseTime', [nextActionTime.add(BigNumber.from(1)).toNumber()]);
                await ethers.provider.send('evm_mine', []);

                await plantContract.connect(addr1).harvest(tokenId);
                const details = await plantContract.connect(addr1).getDetails(tokenId);
                expect(details.harvestCounter).to.equal(1);
                expect(details.wateringCounter).to.equal(0);
            });

            it("Should not allow harvesting rotted plant", async () => {
                await ethers.provider.send('evm_increaseTime', [rottingTime.add(BigNumber.from(1)).toNumber()]);
                await ethers.provider.send('evm_mine', []);

                await expect(plantContract.connect(addr1).harvest(tokenId)).to.be.revertedWith("too late for next action");
            });
        });

        describe("Rotting", function () {
            beforeEach(async () => {
                await plantContract.setIsTimerActive(true);
            });

            it("Should not be rotting just after action", async () => {
                expect(await plantContract.getIsRotted(tokenId)).to.equal(false);
            });

            it("Should not be rotting after getTimeUntilNextAction", async () => {
                await ethers.provider.send('evm_increaseTime', [nextActionTime.add(BigNumber.from(1)).toNumber()]);
                await ethers.provider.send('evm_mine', []);

                expect(await plantContract.getIsRotted(tokenId)).to.equal(false);
            });

            it("Should be rotting after rottingTime", async () => {
                await ethers.provider.send('evm_increaseTime', [rottingTime.add(BigNumber.from(1)).toNumber()]);
                await ethers.provider.send('evm_mine', []);

                expect(await plantContract.getIsRotted(tokenId)).to.equal(true);
            });
        });

        describe("Token Supply Potential", function () {
            beforeEach(async () => {
                await plantContract.setIsTimerActive(true);
            });

            it("Should have potential just after action", async () => {
                expect(await plantContract.calculateTokenSupplyPotential(tokenId)).to.not.equal(0);
            });

            it("Should have potential after getTimeUntilNextAction", async () => {
                await ethers.provider.send('evm_increaseTime', [nextActionTime.add(BigNumber.from(1)).toNumber()]);
                await ethers.provider.send('evm_mine', []);

                expect(await plantContract.calculateTokenSupplyPotential(tokenId)).to.not.equal(0);
            });

            
            it("Should not have potential after rotting", async () => {
                await ethers.provider.send('evm_increaseTime', [rottingTime.add(BigNumber.from(1)).toNumber()]);
                await ethers.provider.send('evm_mine', []);

                expect(await plantContract.calculateTokenSupplyPotential(tokenId)).to.equal(0);
            });
        });


        describe("Owner Configuration", function () {
            it("Should get and set timer", async () => {
                await plantContract.setIsTimerActive(false);
                const timerActive = await plantContract.getIsTimerActive();
                await expect(timerActive).to.equal(false);
            });

            it("Should change TimeUntilNextAction", async () => {
                await plantContract.setTimeUntilNextAction(5);
                nextActionTime = await plantContract.getTimeUntilNextAction();
                await expect(nextActionTime).to.equal(5);
            });

            it("Should change TimeUntilRotted", async () => {
                await plantContract.setTimeUntilRotted(10);
                rottingTime = await plantContract.getTimeUntilRotted();
                await expect(rottingTime).to.equal(10);
            });

            it("Should fail set timer when not owner", async () => {
                await expect(plantContract.connect(addr1).setIsTimerActive(false)).to.be.revertedWith("Ownable: caller is not the owner");
            });

            it("Should fail change TimeUntilNextAction when not owner", async () => {
                await expect(plantContract.connect(addr1).setTimeUntilNextAction(5)).to.be.revertedWith("Ownable: caller is not the owner");
            });

            it("Should fail change TimeUntilRotted when not owner", async () => {
                await expect(plantContract.connect(addr1).setTimeUntilRotted(10)).to.be.revertedWith("Ownable: caller is not the owner");
            });
        });
    });

    describe("SVG", function () {
        let tokenId: BigNumber;

        beforeEach(async () => {
            await plantContract.connect(addr1).mint({ value: sellPrice });
            tokenId = await plantContract.tokenOfOwnerByIndex(addr1.address, 0);
        });

        it("Should generate plant with correct metadata which is ned seeded yet", async () => {
            const tokenURI = await plantContract.tokenURI(tokenId);

            const cleanedTokenURI = tokenURI.substring(29);
            const decodedTokenURI = atob(cleanedTokenURI);

            const tokenResult: ITokenURI = JSON.parse(decodedTokenURI);
            expect(tokenResult.name).to.equal(`Plant ${tokenId}`);
            expect(tokenResult.description.substring(0, 55)).to.equal(`Generated by ${addr1.address.toLocaleLowerCase()}`);

            const level = tokenResult.attributes.find(a => a.trait_type === "Level")?.value;
            expect(level).to.equal("0");

            const harvestCounter = tokenResult.attributes.find(a => a.trait_type === "HarvestCounter")?.value;
            expect(harvestCounter).to.equal("0");

            const cleanedImage = tokenResult.image.substring(26);
            const decodedImage = atob(cleanedImage);
            const document = new XmlDocument(decodedImage);

            const nodes = document.childrenNamed("line")
            expect(nodes.length).to.equal(parseInt(level ?? "0") + 1);
        });

        it("Should generate seeded plant with correct metadata", async () => {
            await plantContract.connect(addr1).seed(tokenId, { value: seedingPrice });
            const tokenURI = await plantContract.tokenURI(tokenId);

            const cleanedTokenURI = tokenURI.substring(29);
            const decodedTokenURI = atob(cleanedTokenURI);

            const tokenResult: ITokenURI = JSON.parse(decodedTokenURI);
            expect(tokenResult.name).to.equal(`Plant ${tokenId}`);
            expect(tokenResult.description.substring(0, 55)).to.equal(`Generated by ${addr1.address.toLocaleLowerCase()}`);

            const level = tokenResult.attributes.find(a => a.trait_type === "Level")?.value;
            expect(level).to.equal("1");

            const harvestCounter = tokenResult.attributes.find(a => a.trait_type === "HarvestCounter")?.value;
            expect(harvestCounter).to.equal("0");

            const cleanedImage = tokenResult.image.substring(26);
            const decodedImage = atob(cleanedImage);
            const document = new XmlDocument(decodedImage);

            const nodes = document.childrenNamed("line")
            expect(nodes.length).to.equal(parseInt(level ?? "0") + 1);
        });


        it("Should generate harvested and leveled up plant with correct metadata", async () => {
            await plantContract.connect(addr1).seed(tokenId, { value: seedingPrice });
            const toLevelUp = 10;
            const toHarvest = 1;

            for (let i = 1; i < toLevelUp; i++) {
                for (let j = 0; j < maxWaterCounter; j++) {
                    await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                }
                await plantContract.connect(addr1).levelUp(tokenId)
            }

            for (let i = 0; i < toHarvest; i++) {
                for (let j = 0; j < maxWaterCounter; j++) {
                    await plantContract.connect(addr1).water(tokenId, { value: wateringPrice });
                }
                await plantContract.connect(addr1).harvest(tokenId)
            }

            const tokenURI = await plantContract.tokenURI(tokenId);

            const cleanedTokenURI = tokenURI.substring(29);
            const decodedTokenURI = atob(cleanedTokenURI);

            const tokenResult: ITokenURI = JSON.parse(decodedTokenURI);
            expect(tokenResult.name).to.equal(`Plant ${tokenId}`);
            expect(tokenResult.description.substring(0, 55)).to.equal(`Generated by ${addr1.address.toLocaleLowerCase()}`);

            const level = tokenResult.attributes.find(a => a.trait_type === "Level")?.value;
            expect(level).to.equal(`${toLevelUp}`);

            const harvestCounter = tokenResult.attributes.find(a => a.trait_type === "HarvestCounter")?.value;
            expect(harvestCounter).to.equal(`${toHarvest}`);

            const cleanedImage = tokenResult.image.substring(26);
            const decodedImage = atob(cleanedImage);
            const document = new XmlDocument(decodedImage);

            const nodes = document.childrenNamed("line")
            expect(nodes.length).to.equal(parseInt(level ?? "0") + 1);
        });

        it("Should fail get metadata for non existent token", async () => {
            await expect(
                plantContract.tokenURI(999)
            ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
        });
    });
});
