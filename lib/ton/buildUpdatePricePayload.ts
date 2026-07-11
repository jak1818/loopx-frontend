import { beginCell } from "@ton/core";

// 先用测试 Opcode，下一步我们统一固定
const OPCODE_UPDATE_PRICE = 0x55704450;

export function buildUpdatePricePayload(
  newPriceUsdt: bigint
): string {

  return beginCell()
    .storeUint(OPCODE_UPDATE_PRICE, 32)
    .storeCoins(newPriceUsdt)
    .endCell()
    .toBoc()
    .toString("base64");

}