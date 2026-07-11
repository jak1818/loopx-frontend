import { beginCell } from "@ton/core";

const OPCODE_CANCEL_LISTING = 3137586877;

export function buildCancelListingPayload(): string {

  return beginCell()
    .storeUint(OPCODE_CANCEL_LISTING, 32)
    .endCell()
    .toBoc()
    .toString("base64");

}