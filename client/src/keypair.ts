import { Ed25519Keypair, normalizeSuiAddress, RawSigner, JsonRpcProvider, fromB64 } from '@mysten/sui.js';
import path from 'path';
import fs from 'fs';

const ENV_PATH = path.resolve(__dirname, '../../', '.env');
const PRIVATE_KEY_ENV_VAR = 'PRIVATE_KEY';

// Build a class to connect to Sui RPC servers
// Default endpoint is devnet 'https://fullnode.devnet.sui.io:443'
export const provider = new JsonRpcProvider();

// Use getSigner() to access this; this value is loaded asychronously and cannot be exported directly
let signer: RawSigner;

async function faucetRequest(address: string) {
  const response = await provider.requestSuiFromFaucet(address);
  return response.transferred_gas_objects;
}

async function loadEnv(): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(ENV_PATH, { encoding: 'utf8' }, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

async function persistEnv(privateKey: string, existingEnv?: string): Promise<void> {
  const data = `${PRIVATE_KEY_ENV_VAR}=${privateKey}\n${existingEnv ? existingEnv : ''}`;

  return new Promise((resolve, reject) => {
    fs.writeFile(ENV_PATH, data, { encoding: 'utf8' }, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

function getPrivateKeyFromEnv(env: string) {
  const lines = env.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith(PRIVATE_KEY_ENV_VAR)) {
      return line.substring(12);
    }
  }
}

async function generateAndPersitKeypair(existingEnv?: string) {
  const keypair = Ed25519Keypair.generate();
  const { privateKey } = keypair.export();
  await persistEnv(privateKey, existingEnv);

  return keypair;
}

async function loadKeypair() {
  try {
    const env = await loadEnv();
    const privateKey = getPrivateKeyFromEnv(env);

    if (privateKey) {
      return Ed25519Keypair.fromSecretKey(fromB64(privateKey));
    }

    return await generateAndPersitKeypair(env);
  } catch (e: any) {
    if (e.code == 'ENOENT') {
      return await generateAndPersitKeypair();
    }

    throw e;
  }
}

async function getSuiCoins(address: string) {
  const coins = await provider.getCoins(address, '0x2::sui::SUI');
  return coins.data;
}

async function main() {
  const keypair = await loadKeypair();
  signer = new RawSigner(keypair, provider);
  const address = keypair.getPublicKey().toSuiAddress();

  console.log('========== Keypair loaded ==========');
  console.log('Address', normalizeSuiAddress(address));

  const coins = await getSuiCoins(address);

  if (coins.length < 1) {
    console.log('========== Sui Airdrop Requested ==========');

    await faucetRequest(address);

    console.log('========== Sui Airdrop Received ==========');
  }
}

export function getSigner(): RawSigner {
  return signer;
}

main();

// To Do: export package-ids here
