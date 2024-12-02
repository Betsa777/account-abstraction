// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";

import "./TK.sol";

//Ne peut pas lui même hérité de ERC20 mais je dois deployer le token ERC20 et a partir de la
//Je peux lui transferer des tokens
contract Account is IAccount {
    error Account_InsuffisantBalance();

    event Account__Deposit(address addr, uint256 amount);
    event Account__transfer(address receiver, uint256 amount);
    address private immutable i_owner;
    Tk private immutable i_token;

    constructor(address owner, address deployedToken) {
        i_owner = owner;
        i_token = Tk(deployedToken);
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 /*missingAccountFunds*/
    ) external view returns (uint256 validationData) {
        userOpHash = ECDSA.toEthSignedMessageHash(userOpHash);
        address actualSigner = ECDSA.recover(userOpHash, userOp.signature);
        validationData = i_owner == actualSigner ? 0 : 1;
    }

    //De nouveaux jetons sont créés et envoyés à l'adresse du smart wallet
    function mint(uint256 amount) external {
        i_token.mint(address(this), amount);
        emit Account__Deposit(address(this), amount);
    }

    //Possibilité de transferer ces jetons vers un autre smart wallet ou vers un EOA
    function transferTo(address receiver, uint256 amount) external {
        if (i_token.balanceOf(address(this)) < amount) {
            revert Account_InsuffisantBalance();
        }
        i_token.transfer(receiver, amount);
        emit Account__transfer(receiver, amount);
    }
}

contract AccountFactory {
    event AccountFactory_account(address senderAddr);

    function createAccount(
        address owner,
        address deployedToken,
        string calldata email
    ) external returns (address) {
        bytes memory bytecode = abi.encodePacked(
            type(Account).creationCode,
            abi.encode(owner, deployedToken)
        );
        bytes32 salt = bytes32(abi.encodePacked(email));
        //Je calcule l'adresse du smart wallet
        address senderAddr = Create2.computeAddress(salt, keccak256(bytecode));
        //S'il a dejà été créé je renvoie son adresse
        if (senderAddr.code.length > 0) {
            return senderAddr;
        }
        //Si non je le crée
        emit AccountFactory_account(senderAddr);
        return Create2.deploy(0, salt, bytecode);
    }
}
