import { run } from "hardhat";

const verify = async () => {
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    throw new Error("Contract address needs to be specified.");
  }

  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
};

export { verify };
