import { ethers } from "hardhat";

async function main() {

  const GameObject = await ethers.getContractFactory("GameObject");
  const gameObject = await GameObject.deploy();

  await gameObject.deployed();

  console.log("Game deployed to:", gameObject.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
