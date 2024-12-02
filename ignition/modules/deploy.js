
//Je deploie ici les contracts AccountFactory, Paymaster et EntryPoint
//avec la première adresse fournie par hardhat
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const deployerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

module.exports = buildModule("AA", (m) => {

  const af = m.contract("AccountFactory");
  const pm = m.contract("Paymaster", [deployerAddress]);
  const ep = m.contract("EntryPoint");
  const tk = m.contract("Tk");
  return { af, ep, pm, tk };
});
