import { beginCell } from "@ton/core";

const OPCODE_BUY_NFT = 1300740350;

export function buildBuyListingPayload(): string {

  return beginCell()
    .storeUint(OPCODE_BUY_NFT, 32)
    .endCell()
    .toBoc()
    .toString("base64");

}