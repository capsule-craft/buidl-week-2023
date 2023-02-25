import { RawSigner } from '@mysten/sui.js';
import { getSigner } from './keypair';

// Devnet address of our Sui Examples Package
const suiExamplesPackageID = '0x08013ebe0ce56c8a4fe0e501f65b42685c538d78';

initialize();

function initialize() {
  getSigner().then(signer => {
    main(signer);
  });
}

async function main(signer: RawSigner) {
  let args: string[];
  let effects: any;

  switch (process.argv[2]) {
    case 'create_currency' || 'create-currency':
      effects = await executeTransaction(signer, 'create_currency', []);
      console.log('====== Object Created ======');
      console.log(effects.events[1]);
      break;

    case 'mint_and_send' || 'mint-and-send':
      if (process.argv.length < 5) {
        throw Error('Missing arguments for mint command');
      }

      args = [...process.argv.slice(3, 5)];
      args[0] = padIntoAddress(args[0]);

      await executeTransaction(signer, 'mint_and_send', args);

      console.log('================================================');
      console.log(`Sent to: ${args[0]}`);
      console.log('================================================');
      break;

    case 'split_and_send' || 'split-and-send':
      if (process.argv.length < 6) {
        throw Error('Missing arguments for mint command');
      }
      args = [...process.argv.slice(3, 6)];
      args[2] = padIntoAddress(args[2]);

      await executeTransaction(signer, 'split_and_send', args);

      console.log('================================================');
      console.log(`Sent to: ${args[2]}`);
      console.log('================================================');
      break;

    case 'create_shared_balance' || 'create_shared_balance':
      if (process.argv.length < 4) {
        throw Error('Missing arguments for mint command');
      }
      effects = await executeTransaction(signer, 'create_shared_balance', [process.argv[3]]);
      console.log('====== Object Created ======');
      console.log(effects.events[1]);
      break;

    case 'issue_budget' || 'issue-budget':
      if (process.argv.length < 6) {
        throw Error('Missing arguments for command');
      }
      args = [...process.argv.slice(3, 6)];
      args[2] = padIntoAddress(args[2]);

      effects = await executeTransaction(signer, 'issue_budget', args);

      console.log('================================================');
      console.log(`Sent to: ${args[2]}`);
      console.log('================================================');
      console.log('====== Object Created ======');
      console.log(effects.events[1]);
      break;

    case 'redeem_budget' || 'redeem-budget':
      if (process.argv.length < 7) {
        throw Error('Missing arguments for command');
      }
      args = [...process.argv.slice(3, 7)];
      args[3] = padIntoAddress(args[3]);

      await executeTransaction(signer, 'redeem_budget', args);

      console.log('================================================');
      console.log(`Sent to: ${args[3]}`);
      console.log('================================================');
      break;

    default:
      console.log('Command not found');
  }
}

async function executeTransaction(signer: RawSigner, functionName: string, args: string[]) {
  const moveCallTxn = await signer.executeMoveCall({
    packageObjectId: suiExamplesPackageID,
    module: 'buidl_coin',
    function: functionName,
    typeArguments: [],
    arguments: [...args],
    gasBudget: 3000
  });

  // @ts-ignore
  console.log(moveCallTxn.effects.effects);

  // @ts-ignore
  return moveCallTxn.effects.effects;
}

// =========== Helper Functions ===========

function padIntoAddress(address: string): string {
  if (address.length >= 42) return address;

  return '0x' + address.padStart(40, '0');
}
