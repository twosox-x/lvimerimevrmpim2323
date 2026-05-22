import { JsonRpcProvider, formatUnits, getAddress, parseUnits, zeroPadValue } from "ethers";
import { config, requireRuntimeConfig } from "./config";
import { HttpError, normalizeAddress } from "./http";

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export type PaymentVerificationInput = {
  txHash: string;
  from: string;
  to: string;
  token: "ETH" | "L00T";
  tokenAddress?: string;
  minimumAmount: string;
};

function provider() {
  requireRuntimeConfig(["baseRpcUrl"]);
  return new JsonRpcProvider(config.baseRpcUrl, config.baseChainId);
}

export async function verifyBasePayment(input: PaymentVerificationInput) {
  const rpc = provider();
  const network = await rpc.getNetwork();
  if (Number(network.chainId) !== config.baseChainId) {
    throw new HttpError(503, `RPC chain mismatch. Expected Base chain ${config.baseChainId}`);
  }

  const receipt = await rpc.getTransactionReceipt(input.txHash);
  if (!receipt || receipt.status !== 1) throw new HttpError(400, "Transaction is not confirmed");
  const tx = await rpc.getTransaction(input.txHash);
  if (!tx) throw new HttpError(400, "Transaction not found");

  const expectedFrom = normalizeAddress(input.from);
  const expectedTo = normalizeAddress(input.to);

  if (input.token === "ETH") {
    if (normalizeAddress(tx.from) !== expectedFrom) throw new HttpError(400, "ETH payment sender mismatch");
    if (!tx.to || normalizeAddress(tx.to) !== expectedTo) throw new HttpError(400, "ETH payment recipient mismatch");
    if (tx.value < parseUnits(input.minimumAmount, 18)) throw new HttpError(400, "ETH payment amount too low");
    return { amount: formatUnits(tx.value, 18), chainId: config.baseChainId };
  }

  const tokenAddress = input.tokenAddress || config.lootTokenAddress;
  if (!tokenAddress) throw new HttpError(503, "L00T_TOKEN_ADDRESS is not configured");
  const normalizedToken = normalizeAddress(getAddress(tokenAddress));
  const fromTopic = zeroPadValue(expectedFrom, 32).toLowerCase();
  const toTopic = zeroPadValue(expectedTo, 32).toLowerCase();

  const transfer = receipt.logs.find((log) => {
    return (
      normalizeAddress(log.address) === normalizedToken &&
      log.topics[0]?.toLowerCase() === TRANSFER_TOPIC &&
      log.topics[1]?.toLowerCase() === fromTopic &&
      log.topics[2]?.toLowerCase() === toTopic
    );
  });

  if (!transfer) throw new HttpError(400, "L00T transfer log not found");
  const amount = BigInt(transfer.data);
  if (amount < parseUnits(input.minimumAmount, 18)) throw new HttpError(400, "L00T payment amount too low");
  return { amount: formatUnits(amount, 18), chainId: config.baseChainId };
}
