import { verifyContract } from '../helpers/verify-contract';
import { ethers } from 'hardhat';

const Manager = '0x61E0e280B1E05FCEfb684dd729cDe782fd98cd40';

const Oracle = '0xB99B7a11B0e6BF8F0220f7C4E9Bd5BA37d195da5'

async function main(): Promise<void> {

	await verifyContract(Oracle, [Manager]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch((error: Error) => {
		console.error(error);
		process.exit(1);
	});
