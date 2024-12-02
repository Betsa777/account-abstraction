// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@account-abstraction/contracts/interfaces/IPaymaster.sol";

contract Paymaster is IPaymaster {
    address private immutable i_owner;

    constructor(address owner) {
        i_owner = owner;
    }

    //Paye les frais de gaz si la signature est verifiée
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 /*maxCost*/
    ) external view returns (bytes memory context, uint256 validationData) {
        context = new bytes(0);
        userOpHash = ECDSA.toEthSignedMessageHash(userOpHash);
        address actualSigner = ECDSA.recover(userOpHash, userOp.signature);
        validationData = actualSigner == i_owner ? 0 : 1;
    }

    //J'ajoute ca parce que je veux envoyer des fonds au contract pour assurer les frais de gaz
    fallback() external payable {}

    receive() external payable {}

    function postOp(
        PostOpMode /*mode*/,
        bytes calldata /*context*/,
        uint256 /*actualGasCost*/
    ) external {}
}
