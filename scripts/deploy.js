async function main() {
  const MentoratNFT = await ethers.getContractFactory("MentoratNFT")

  // Start deployment, returning a promise that resolves to a contract object
  const mentoratNFT = await MentoratNFT.deploy(["0x0"],[100])
  await mentoratNFT.deployed()
  console.log("Contract deployed to address:", mentoratNFT.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
