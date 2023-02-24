import {
  DevInspectResults,
  MoveCall,
  MoveCallTransaction,
  SuiExecuteTransactionResponse,
  UnserializedSignableTransaction
} from '@mysten/sui.js';
import { parseViewResultsFromStruct, bcs } from './capsules_sdk';
import { provider, getSigner } from './keypair';
import { assert } from 'superstruct';

// To Do: specify package-ids here

function doSomething() {
  getSigner().then(signer => {
    console.log(signer);
  });
}

doSomething();
