Executer ces commandes pour installer les dépendances et lancer les tests
Vous devez disposer de node.js installé sur votre ordinateur
`npm install`
`npx hardhat node` pour lancer la blockchain locale d'hardhat
`npx hardhat ignition deploy ignition/modules/deploy.js` pour deployer les différents smarts contracts 
`npx hardhat run scripts/depositToPm.js` Pour envoyer un certain montant d'ethers de test au paymaster 
`npx hardhat run scripts/mint.js` Pour envoyer des tokens au smart wallet de l'utilisateur
`npx hardhat run scripts/transfer.js` Pour que l'utilisateur puisse envoyer des tokens depuis
son smart wallet vers un EOA