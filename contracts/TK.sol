// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Tk is ERC20 {
    error Tk__Adrres0();

    constructor() ERC20("token", "TK") {}

    function mint(address receiver, uint256 amount) external {
        if (receiver == address(0)) {
            revert Tk__Adrres0();
        }
        _mint(receiver, amount);
    }
}
