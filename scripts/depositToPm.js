//Adresse du paymaster
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
//Adresse du entrypoint
const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const { ethers } = require('hardhat')
async function main() {
    const entrypoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS)
    //J'utilise la fonction depositTo de StakeManager.sol que EntryPoint herite
    //value sera considéré comme mon msg.value dans StakeManager
    await entrypoint.depositTo(PM_ADDRESS, {
        value: ethers.parseEther("2")
    })
    console.log("depot reussi")
}

main()
    .catch(err => console.log(err)
    )