import {
  beginCell,
  Address
} from "@ton/core";

export default function buildTransferPayload({
  newOwner,
  responseDestination
}) {

  return beginCell()
    .storeUint(
      0x5fcc3d14,
      32
    )
    .storeUint(
      Date.now(),
      64
    )

    .storeAddress(
      Address.parse(newOwner)
    )

    .storeAddress(
      Address.parse(
        responseDestination
      )
    )

    .storeBit(0)

    .storeCoins(1)

    .storeBit(0)

    .endCell()

    .toBoc()

    .toString("base64");
}