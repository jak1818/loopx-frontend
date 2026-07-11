import { beginCell } from "@ton/core";

// 暂时先用这个 Opcode
// 最后 deploy 前统一确认
const OPCODE_RELIST = 0x524C5354;

export function buildRelistPayload(
  newPriceUsdt: bigint,
  listingType: bigint,
  endTime: bigint
): string {

  return beginCell()
  .storeUint(OPCODE_RELIST, 32)
  .storeCoins(newPriceUsdt)
  .storeInt(listingType, 257)
  .storeInt(endTime, 257)
  .endCell()
  .toBoc()
  .toString("base64");

}