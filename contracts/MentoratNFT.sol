// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "erc721a/contracts/ERC721A.sol";

contract MentoratNFT is ERC721A, Ownable, PaymentSplitter, ERC2981 {
    uint256 public supply = 420;
    uint256 public constant RESERVE = 25;

    mapping(address => uint256) mintedByAddress;

    // From ERC721URIStorage.sol
    mapping(uint256 => string) private _tokenURIs;

    bool public reserved;

    constructor(address[] memory team, uint256[] memory teamShares)
        ERC721A("MentoratNFT", "MNFT")
        PaymentSplitter(team, teamShares)
    {
        _safeMint(msg.sender, 1);
        _setDefaultRoyalty(address(this), 2500);
    }

    function setRoyalties(address _receiver, uint96 _feeBasisPoint)
        public
        onlyOwner
    {
        require(_feeBasisPoint > 0, "You need royalties");
        require(_feeBasisPoint < 10000, "Don't be greedy");
        require(_receiver != address(0), "Keep them");

        _setDefaultRoyalty(_receiver, _feeBasisPoint);
    }

    function setSupply(uint256 _newSupply) public onlyOwner {
        require(_newSupply > 0, "Can't put 0");
        supply = _newSupply;
    }

    function mint(string memory _tokenURI) public {
        require(totalSupply() + 1 <= supply, "SOLD OUT!");
        //require(mintedByAddress[msg.sender] < 1, "Already minted!");

        uint256 newTokenId = totalSupply();
        mintedByAddress[msg.sender]++;

        _safeMint(msg.sender, 1);
        _setTokenURI(newTokenId, _tokenURI);
    }

    function reserve() public onlyOwner {
        require(!reserved, "You have already reserved");
        require(totalSupply() + RESERVE <= supply, "Mint too large");

        reserved = true;

        _safeMint(msg.sender, RESERVE);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        pure
        override(ERC721A, ERC2981)
        returns (bool)
    {
        // The interface IDs are constants representing the first 4 bytes
        // of the XOR of all function selectors in the interface.
        // See: [ERC165](https://eips.ethereum.org/EIPS/eip-165)
        // (e.g. `bytes4(i.functionA.selector ^ i.functionB.selector ^ ...)`)
        return
            interfaceId == 0x01ffc9a7 || // ERC165 interface ID for ERC165.
            interfaceId == 0x80ac58cd || // ERC165 interface ID for ERC721.
            interfaceId == 0x5b5e139f || // ERC165 interface ID for ERC721Metadata.
            interfaceId == 0x2a55205a; //ERC 2981
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        //_requireMinted(tokenId);

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return super.tokenURI(tokenId);
    }

    // From ERC721URIStorage.sol
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }
}
