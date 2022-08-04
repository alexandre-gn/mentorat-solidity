# Projet NFT Mentorat Drengr

Ce projet de NFT a été réalisé dans le cadre du mentorat Solidity de Drengr. Ce travail guidé a permis aux participants de créer et tester un contrat réel, qui peut être réutiliser pour lancer une collection NFT.

## Commandes utiles

Les commandes peuvent être lancées avec Yarn ou NPM

Installations des librairies : 

`yarn install` ou `npm install`

Compilation :

`npm hardhat compile`

Tests : 

`yarn hardhat test`

## Contributions

Si vous pensez avoir déceler une erreur, ou vous voulez proposez une amélioration, n'hésiitez pas à proposer une pull request ou ouvrir une issue.

## Prochaine étape

Le but est de construire une dApp permettant de minter sur ce contrat. Le reste est laissé libre.

## Les librairies à utiliser

Nous vous conseillons d'utiliser la librairie [ethers](https://docs.ethers.io/v5/) pour la partie interaction avec la blockchain

La librairie [web3modal](https://github.com/WalletConnect/web3modal) permet de facilement connecter des wallets

PS: Pour lier les deux récupérez un Web3Provider depuis la modal, et utilisez un Web3Povider dans ethers.

