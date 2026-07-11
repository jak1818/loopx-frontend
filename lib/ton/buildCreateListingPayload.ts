import {
  beginCell,
  Address,
} from "@ton/core";

export function buildCreateListingPayload({
  collectibleId,
  nftAddress,
  creator,
  priceUsdt,
  listingType,
  endTime,
}: {
  collectibleId: bigint;
  nftAddress: string;
  creator: string;
  priceUsdt: bigint;
  listingType: bigint;
  endTime: bigint;
}) {

  const body = beginCell();

  body.storeUint(
    2029449158,
    32
  );

  body.storeInt(
    collectibleId,
    257
  );

  body.storeAddress(
    Address.parse(
      nftAddress
    )
  );

  body.storeAddress(
    Address.parse(
      creator
    )
  );

  const ref = beginCell();

  ref.storeInt(
    priceUsdt,
    257
  );

  ref.storeInt(
    listingType,
    257
  );

  ref.storeInt(
    endTime,
    257
  );

  body.storeRef(
    ref.endCell()
  );

  return body
    .endCell()
    .toBoc()
    .toString("base64");

}