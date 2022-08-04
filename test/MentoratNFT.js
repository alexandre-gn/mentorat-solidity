const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Propostion", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const MentoratNFT = await ethers.getContractFactory("MentoratNFT");
        const mentoratNft = await MentoratNFT.deploy([owner.address], [100]);

        return { mentoratNft, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should deploy without errors", async function () {
            await loadFixture(deploy);
        });
    });

    describe("Admin", function () {
        it("Should not reserve if already done", async () => {
            let { mentoratNft, owner } = await loadFixture(deploy);

            await mentoratNft.reserve();

            await expect(mentoratNft.reserve()).to.be.revertedWith(
                "You have already reserved"
            );
        });

        it("Should not reserve mint more than supply", async () => {
            let { mentoratNft, owner } = await loadFixture(deploy);

            await mentoratNft.setSupply(25);

            await expect(mentoratNft.reserve()).to.be.revertedWith(
                "Mint too large"
            );
        });

        it("Should reserve correctly", async () => {
            let { mentoratNft } = await loadFixture(deploy);

            await mentoratNft.reserve();

            expect(await mentoratNft.reserved()).to.equal(true);
        });

        it("Should not change if fee is 0", async() => {
          let { mentoratNft, owner } = await loadFixture(deploy);

          await expect(mentoratNft.setRoyalties(owner.address, 0)).to.be.revertedWith("You need royalties")
        })

        it("Should not change if fee is more than 9999", async() => {
          let { mentoratNft, owner } = await loadFixture(deploy);

          await expect(mentoratNft.setRoyalties(owner.address, 10000)).to.be.revertedWith("Don't be greedy")
        })

        it("Should not change if receiver is zero address", async() => {
          let { mentoratNft, owner } = await loadFixture(deploy);

          await expect(mentoratNft.setRoyalties(ethers.constants.AddressZero, 10)).to.be.revertedWith("Keep them")
        });

        it("Should change default royalties", async() => {
          let { mentoratNft, owner } = await loadFixture(deploy);

          await mentoratNft.setRoyalties(owner.address, 5000);

          let infos = await mentoratNft.royaltyInfo(0, 100);
          /*

          [royaltyReceiver, royaltyAmount]

          [address -> string, uint256 -> BigNumber ]

          */
          expect(infos[0]).to.equal(owner.address);

          expect(infos[1]).to.equal(50);
        });
    });

    describe("Mint", function () {
        it("Should not mint more than max supply", async () => {
            let { mentoratNft, owner, otherAccount } = await loadFixture(
                deploy
            );

            await mentoratNft.setSupply(1);

            await expect(
                mentoratNft.connect(otherAccount).mint()
            ).to.be.revertedWith("SOLD OUT!");
        });

        it("Should not mint more 1 NFT by address", async () => {
            let { mentoratNft, owner, otherAccount } = await loadFixture(
                deploy
            );

            await mentoratNft.connect(otherAccount).mint();

            await expect(
                mentoratNft.connect(otherAccount).mint()
            ).to.be.revertedWith("Already minted!");
        });

        it("Should mint one NFT", async () => {
            let { mentoratNft, owner, otherAccount } = await loadFixture(
                deploy
            );

            await expect(mentoratNft.connect(otherAccount).mint())
                .to.emit(mentoratNft, "Transfer")
                .withArgs(
                    ethers.constants.AddressZero,
                    otherAccount.address,
                    1
                );

            expect(await mentoratNft.balanceOf(otherAccount.address)).to.equal(
                1
            );
        });
    });
});
