import { Address } from "@ton/core";

import {
  Listing
} from "@/src/lib/ton/contracts/MarketplaceRoot_Listing";

export async function calculateListingAddress({

  collectibleId,
  nftAddress,
  seller,
  creator,
  platformWallet,
  usdtMaster,
  priceUsdt,
  listingType,
  endTime

}: {

  collectibleId: bigint;
  nftAddress: string;
  seller: string;
  creator: string;
  platformWallet: string;
  usdtMaster: string;
  priceUsdt: bigint;
  listingType: bigint;
  endTime: bigint;

}) {

  const listing =
    await Listing.fromInit({

      $$type: "ListingData",

      collectibleId,

      nftAddress:
        Address.parse(
          nftAddress
        ),

      seller:
        Address.parse(
          seller
        ),

      creator:
        Address.parse(
          creator
        ),

      buyer: null,

      platformWallet:
        Address.parse(
          platformWallet
        ),

      usdtMaster:
        Address.parse(
          usdtMaster
        ),

      priceUsdt,

      listingType,

      endTime,

      active: false,

      highestBid: 0n,

      highestBidder: null,

      ownershipAssignedCount: 0n,

      fallbackCount: 0n

    });
	
	alert(
  listing.address.toRawString()
);

alert(
  listing.address.toString()
);

alert(
  listing.address.toString({
    urlSafe: true,
    bounceable: true,
    testOnly: true
  })
);

alert(
  listing.address.toString({
    urlSafe: true,
    bounceable: true,
    testOnly: false
  })
);

  return listing.address.toString({
  urlSafe: true,
  bounceable: true,
  testOnly: true
});

}