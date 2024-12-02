//Dans ce fichier je definit le userOperation pour faire créer de nouveaux jetons 
//et les envoyer au smart wallet du user
const { ethers } = require('hardhat')
//Adresse du entrypoint
const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
//Adresse du account factory
const AF_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
//Adresse du paymaster
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

//Addresse du token deployé
const TK_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
const RPC_URL = "http://127.0.0.1:8545"
//prmière addresse fournie par harhdat
const ownerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
//Cette  clé privée provient de la blockchain d'hardhat donc pas de problème en l'exposant
const ownerPrivKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

//Pour juste le test
const usedMailAdress = "dakuyo@gmail.com"
//Le nombre de jetons pour le smart wallet 
const AmountToMint = 20_000


async function main() {
    const entrypoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS)
    const tk = await ethers.getContractAt("Tk", TK_ADDRESS)
    const AccountFactory = await ethers.getContractFactory("AccountFactory")
    const Account = await ethers.getContractFactory("Account")
    //La fonction createAccount de AccountFactory.sol prend deux parmaètres 
    //a savoir l'adresse du propriétaire du compte et une adresse email
    //pour que les comptes en fonctions des adresses mails changent
    const accountFactoryEncodedData = AccountFactory.interface.encodeFunctionData("createAccount", [ownerAddress, TK_ADDRESS, usedMailAdress])
    //J'nelève le 0x au debut de accountFactoryEncodedData pour que l'initCode n'ait pas un problème
    let initCode = AF_ADDRESS + accountFactoryEncodedData.slice(2)
    let sender;
    try {
        //Cette fonction fait toujours un revert 
        //Et donc j'utilise un bloc try catch pour recuperer l'adresse du sender
        //ici qui reprensente l'adresse de mon smart wallet 
        await entrypoint.getSenderAddress(initCode)
    } catch ({ data }) {
        console.log(data)
        //L'addresse du sender (smart wallet correspond au 40 derniers bytes de data.data)
        //donc je peux la recuperer
        sender = "0x" + data.data.slice(-40)
        console.log({ sender })
    }
    //Si le smart wallet a dejà été deployé je recupère son code
    const senderCodeIfAlreadyDeployed = await ethers.provider.getCode(sender)
    console.log({ senderCodeIfAlreadyDeployed })
    //S'il a deja été  deployé je n'ai plus besoin du initCode pour la création du compte
    if (senderCodeIfAlreadyDeployed !== "0x") {
        initCode = "0x"
    }
    const accountEncodedData = Account.interface.encodeFunctionData("mint", [AmountToMint])
    let callData = accountEncodedData
    //Je specifie les limites de gazs juste pour des tests
    let callGasLimit = 1_000_000
    let verificationGasLimit = 1_000_000
    let preVerificationGas = 200_000
    let maxFeePerGas = ethers.parseUnits("10", "gwei")
    let maxPriorityFeePerGas = ethers.parseUnits("5", "gwei")

    let paymasterAndData = PM_ADDRESS
    //je recupère le nonce du sender(smart wallet)
    let nonce = await entrypoint.getNonce(sender, 0)
    let userOp = {
        sender,
        nonce,
        initCode,
        callData,
        callGasLimit,
        verificationGasLimit,
        preVerificationGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        paymasterAndData,
        signature: "0x"
    }
    //je recupère le hash du userOperation
    const userOpHash = await entrypoint.getUserOpHash(userOp)
    console.log({ userOpHash })
    //Suit l'EIP-191 pour le format de signature c'est ce que j'utilise dans les smart contract
    //Pour verifier la validité du userOperation
    //La signature doit etre de type bytes car ECDSA.recover prend comme deuxieme parametre une 
    //signature de type bytes et ethers.getBytes me permet de convertir le userOpHash en bytes
    //en quelque sortes
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const wallet = new ethers.Wallet(ownerPrivKey, provider)
    const signature = await wallet.signMessage(ethers.getBytes(userOpHash))
    console.log({ signature })
    console.log({ initCode })
    userOp.signature = signature
    //Je joue ici le rôle du bundler pour envoyer le userOperation sur l'EntryPoint

    const receipt = await entrypoint.handleOps([userOp], ownerAddress)
    await receipt.wait()
    console.log(receipt)
    const senderBalance = await tk.balanceOf(sender)
    console.log("Les tokens ont bien été envoyés à l'adresse ", { sender })
    console.log("la balance du sender est ", Number(senderBalance), "Tk")

}

main()
    .catch(err => console.log(err)
    )