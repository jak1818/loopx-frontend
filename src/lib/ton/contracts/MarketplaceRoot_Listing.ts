import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type EscrowNFT = {
    $$type: 'EscrowNFT';
    collectibleId: bigint;
    creator: Address;
    priceUsdt: bigint;
    listingType: bigint;
    endTime: bigint;
}

export function storeEscrowNFT(src: EscrowNFT) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3854535145, 32);
        b_0.storeInt(src.collectibleId, 257);
        b_0.storeAddress(src.creator);
        b_0.storeInt(src.priceUsdt, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.listingType, 257);
        b_1.storeInt(src.endTime, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadEscrowNFT(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3854535145) { throw Error('Invalid prefix'); }
    const _collectibleId = sc_0.loadIntBig(257);
    const _creator = sc_0.loadAddress();
    const _priceUsdt = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _listingType = sc_1.loadIntBig(257);
    const _endTime = sc_1.loadIntBig(257);
    return { $$type: 'EscrowNFT' as const, collectibleId: _collectibleId, creator: _creator, priceUsdt: _priceUsdt, listingType: _listingType, endTime: _endTime };
}

export function loadTupleEscrowNFT(source: TupleReader) {
    const _collectibleId = source.readBigNumber();
    const _creator = source.readAddress();
    const _priceUsdt = source.readBigNumber();
    const _listingType = source.readBigNumber();
    const _endTime = source.readBigNumber();
    return { $$type: 'EscrowNFT' as const, collectibleId: _collectibleId, creator: _creator, priceUsdt: _priceUsdt, listingType: _listingType, endTime: _endTime };
}

export function loadGetterTupleEscrowNFT(source: TupleReader) {
    const _collectibleId = source.readBigNumber();
    const _creator = source.readAddress();
    const _priceUsdt = source.readBigNumber();
    const _listingType = source.readBigNumber();
    const _endTime = source.readBigNumber();
    return { $$type: 'EscrowNFT' as const, collectibleId: _collectibleId, creator: _creator, priceUsdt: _priceUsdt, listingType: _listingType, endTime: _endTime };
}

export function storeTupleEscrowNFT(source: EscrowNFT) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.collectibleId);
    builder.writeAddress(source.creator);
    builder.writeNumber(source.priceUsdt);
    builder.writeNumber(source.listingType);
    builder.writeNumber(source.endTime);
    return builder.build();
}

export function dictValueParserEscrowNFT(): DictionaryValue<EscrowNFT> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEscrowNFT(src)).endCell());
        },
        parse: (src) => {
            return loadEscrowNFT(src.loadRef().beginParse());
        }
    }
}

export type CancelListing = {
    $$type: 'CancelListing';
}

export function storeCancelListing(src: CancelListing) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3137586877, 32);
    };
}

export function loadCancelListing(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3137586877) { throw Error('Invalid prefix'); }
    return { $$type: 'CancelListing' as const };
}

export function loadTupleCancelListing(source: TupleReader) {
    return { $$type: 'CancelListing' as const };
}

export function loadGetterTupleCancelListing(source: TupleReader) {
    return { $$type: 'CancelListing' as const };
}

export function storeTupleCancelListing(source: CancelListing) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserCancelListing(): DictionaryValue<CancelListing> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCancelListing(src)).endCell());
        },
        parse: (src) => {
            return loadCancelListing(src.loadRef().beginParse());
        }
    }
}

export type BuyNFT = {
    $$type: 'BuyNFT';
}

export function storeBuyNFT(src: BuyNFT) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1300740350, 32);
    };
}

export function loadBuyNFT(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1300740350) { throw Error('Invalid prefix'); }
    return { $$type: 'BuyNFT' as const };
}

export function loadTupleBuyNFT(source: TupleReader) {
    return { $$type: 'BuyNFT' as const };
}

export function loadGetterTupleBuyNFT(source: TupleReader) {
    return { $$type: 'BuyNFT' as const };
}

export function storeTupleBuyNFT(source: BuyNFT) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserBuyNFT(): DictionaryValue<BuyNFT> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBuyNFT(src)).endCell());
        },
        parse: (src) => {
            return loadBuyNFT(src.loadRef().beginParse());
        }
    }
}

export type NftTransfer = {
    $$type: 'NftTransfer';
    queryId: bigint;
    newOwner: Address;
    responseDestination: Address;
    customPayload: Cell | null;
    forwardAmount: bigint;
    forwardPayload: Slice;
}

export function storeNftTransfer(src: NftTransfer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1839186871, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
        b_0.storeAddress(src.responseDestination);
        if (src.customPayload !== null && src.customPayload !== undefined) { b_0.storeBit(true).storeRef(src.customPayload); } else { b_0.storeBit(false); }
        b_0.storeCoins(src.forwardAmount);
        b_0.storeBuilder(src.forwardPayload.asBuilder());
    };
}

export function loadNftTransfer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1839186871) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    const _responseDestination = sc_0.loadAddress();
    const _customPayload = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _forwardAmount = sc_0.loadCoins();
    const _forwardPayload = sc_0;
    return { $$type: 'NftTransfer' as const, queryId: _queryId, newOwner: _newOwner, responseDestination: _responseDestination, customPayload: _customPayload, forwardAmount: _forwardAmount, forwardPayload: _forwardPayload };
}

export function loadTupleNftTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    const _responseDestination = source.readAddress();
    const _customPayload = source.readCellOpt();
    const _forwardAmount = source.readBigNumber();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'NftTransfer' as const, queryId: _queryId, newOwner: _newOwner, responseDestination: _responseDestination, customPayload: _customPayload, forwardAmount: _forwardAmount, forwardPayload: _forwardPayload };
}

export function loadGetterTupleNftTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    const _responseDestination = source.readAddress();
    const _customPayload = source.readCellOpt();
    const _forwardAmount = source.readBigNumber();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'NftTransfer' as const, queryId: _queryId, newOwner: _newOwner, responseDestination: _responseDestination, customPayload: _customPayload, forwardAmount: _forwardAmount, forwardPayload: _forwardPayload };
}

export function storeTupleNftTransfer(source: NftTransfer) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    builder.writeAddress(source.responseDestination);
    builder.writeCell(source.customPayload);
    builder.writeNumber(source.forwardAmount);
    builder.writeSlice(source.forwardPayload.asCell());
    return builder.build();
}

export function dictValueParserNftTransfer(): DictionaryValue<NftTransfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNftTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadNftTransfer(src.loadRef().beginParse());
        }
    }
}

export type ListingData = {
    $$type: 'ListingData';
    collectibleId: bigint;
    nftAddress: Address;
    seller: Address;
    creator: Address;
    buyer: Address | null;
    platformWallet: Address;
    usdtMaster: Address;
    priceUsdt: bigint;
    listingType: bigint;
    endTime: bigint;
    active: boolean;
    highestBid: bigint;
    highestBidder: Address | null;
    ownershipAssignedCount: bigint;
    fallbackCount: bigint;
}

export function storeListingData(src: ListingData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.collectibleId, 257);
        b_0.storeAddress(src.nftAddress);
        b_0.storeAddress(src.seller);
        const b_1 = new Builder();
        b_1.storeAddress(src.creator);
        b_1.storeAddress(src.buyer);
        b_1.storeAddress(src.platformWallet);
        const b_2 = new Builder();
        b_2.storeAddress(src.usdtMaster);
        b_2.storeInt(src.priceUsdt, 257);
        b_2.storeInt(src.listingType, 257);
        const b_3 = new Builder();
        b_3.storeInt(src.endTime, 257);
        b_3.storeBit(src.active);
        b_3.storeInt(src.highestBid, 257);
        b_3.storeAddress(src.highestBidder);
        const b_4 = new Builder();
        b_4.storeInt(src.ownershipAssignedCount, 257);
        b_4.storeInt(src.fallbackCount, 257);
        b_3.storeRef(b_4.endCell());
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadListingData(slice: Slice) {
    const sc_0 = slice;
    const _collectibleId = sc_0.loadIntBig(257);
    const _nftAddress = sc_0.loadAddress();
    const _seller = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _creator = sc_1.loadAddress();
    const _buyer = sc_1.loadMaybeAddress();
    const _platformWallet = sc_1.loadAddress();
    const sc_2 = sc_1.loadRef().beginParse();
    const _usdtMaster = sc_2.loadAddress();
    const _priceUsdt = sc_2.loadIntBig(257);
    const _listingType = sc_2.loadIntBig(257);
    const sc_3 = sc_2.loadRef().beginParse();
    const _endTime = sc_3.loadIntBig(257);
    const _active = sc_3.loadBit();
    const _highestBid = sc_3.loadIntBig(257);
    const _highestBidder = sc_3.loadMaybeAddress();
    const sc_4 = sc_3.loadRef().beginParse();
    const _ownershipAssignedCount = sc_4.loadIntBig(257);
    const _fallbackCount = sc_4.loadIntBig(257);
    return { $$type: 'ListingData' as const, collectibleId: _collectibleId, nftAddress: _nftAddress, seller: _seller, creator: _creator, buyer: _buyer, platformWallet: _platformWallet, usdtMaster: _usdtMaster, priceUsdt: _priceUsdt, listingType: _listingType, endTime: _endTime, active: _active, highestBid: _highestBid, highestBidder: _highestBidder, ownershipAssignedCount: _ownershipAssignedCount, fallbackCount: _fallbackCount };
}

export function loadTupleListingData(source: TupleReader) {
    const _collectibleId = source.readBigNumber();
    const _nftAddress = source.readAddress();
    const _seller = source.readAddress();
    const _creator = source.readAddress();
    const _buyer = source.readAddressOpt();
    const _platformWallet = source.readAddress();
    const _usdtMaster = source.readAddress();
    const _priceUsdt = source.readBigNumber();
    const _listingType = source.readBigNumber();
    const _endTime = source.readBigNumber();
    const _active = source.readBoolean();
    const _highestBid = source.readBigNumber();
    const _highestBidder = source.readAddressOpt();
    const _ownershipAssignedCount = source.readBigNumber();
    const _fallbackCount = source.readBigNumber();
    return { $$type: 'ListingData' as const, collectibleId: _collectibleId, nftAddress: _nftAddress, seller: _seller, creator: _creator, buyer: _buyer, platformWallet: _platformWallet, usdtMaster: _usdtMaster, priceUsdt: _priceUsdt, listingType: _listingType, endTime: _endTime, active: _active, highestBid: _highestBid, highestBidder: _highestBidder, ownershipAssignedCount: _ownershipAssignedCount, fallbackCount: _fallbackCount };
}

export function loadGetterTupleListingData(source: TupleReader) {
    const _collectibleId = source.readBigNumber();
    const _nftAddress = source.readAddress();
    const _seller = source.readAddress();
    const _creator = source.readAddress();
    const _buyer = source.readAddressOpt();
    const _platformWallet = source.readAddress();
    const _usdtMaster = source.readAddress();
    const _priceUsdt = source.readBigNumber();
    const _listingType = source.readBigNumber();
    const _endTime = source.readBigNumber();
    const _active = source.readBoolean();
    const _highestBid = source.readBigNumber();
    const _highestBidder = source.readAddressOpt();
    const _ownershipAssignedCount = source.readBigNumber();
    const _fallbackCount = source.readBigNumber();
    return { $$type: 'ListingData' as const, collectibleId: _collectibleId, nftAddress: _nftAddress, seller: _seller, creator: _creator, buyer: _buyer, platformWallet: _platformWallet, usdtMaster: _usdtMaster, priceUsdt: _priceUsdt, listingType: _listingType, endTime: _endTime, active: _active, highestBid: _highestBid, highestBidder: _highestBidder, ownershipAssignedCount: _ownershipAssignedCount, fallbackCount: _fallbackCount };
}

export function storeTupleListingData(source: ListingData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.collectibleId);
    builder.writeAddress(source.nftAddress);
    builder.writeAddress(source.seller);
    builder.writeAddress(source.creator);
    builder.writeAddress(source.buyer);
    builder.writeAddress(source.platformWallet);
    builder.writeAddress(source.usdtMaster);
    builder.writeNumber(source.priceUsdt);
    builder.writeNumber(source.listingType);
    builder.writeNumber(source.endTime);
    builder.writeBoolean(source.active);
    builder.writeNumber(source.highestBid);
    builder.writeAddress(source.highestBidder);
    builder.writeNumber(source.ownershipAssignedCount);
    builder.writeNumber(source.fallbackCount);
    return builder.build();
}

export function dictValueParserListingData(): DictionaryValue<ListingData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeListingData(src)).endCell());
        },
        parse: (src) => {
            return loadListingData(src.loadRef().beginParse());
        }
    }
}

export type Listing$Data = {
    $$type: 'Listing$Data';
    data: ListingData;
}

export function storeListing$Data(src: Listing$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.store(storeListingData(src.data));
    };
}

export function loadListing$Data(slice: Slice) {
    const sc_0 = slice;
    const _data = loadListingData(sc_0);
    return { $$type: 'Listing$Data' as const, data: _data };
}

export function loadTupleListing$Data(source: TupleReader) {
    const _data = loadTupleListingData(source);
    return { $$type: 'Listing$Data' as const, data: _data };
}

export function loadGetterTupleListing$Data(source: TupleReader) {
    const _data = loadGetterTupleListingData(source);
    return { $$type: 'Listing$Data' as const, data: _data };
}

export function storeTupleListing$Data(source: Listing$Data) {
    const builder = new TupleBuilder();
    builder.writeTuple(storeTupleListingData(source.data));
    return builder.build();
}

export function dictValueParserListing$Data(): DictionaryValue<Listing$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeListing$Data(src)).endCell());
        },
        parse: (src) => {
            return loadListing$Data(src.loadRef().beginParse());
        }
    }
}

export type CreateListing = {
    $$type: 'CreateListing';
    collectibleId: bigint;
    nftAddress: Address;
    creator: Address;
    priceUsdt: bigint;
    listingType: bigint;
    endTime: bigint;
}

export function storeCreateListing(src: CreateListing) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2029449158, 32);
        b_0.storeInt(src.collectibleId, 257);
        b_0.storeAddress(src.nftAddress);
        b_0.storeAddress(src.creator);
        const b_1 = new Builder();
        b_1.storeInt(src.priceUsdt, 257);
        b_1.storeInt(src.listingType, 257);
        b_1.storeInt(src.endTime, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadCreateListing(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2029449158) { throw Error('Invalid prefix'); }
    const _collectibleId = sc_0.loadIntBig(257);
    const _nftAddress = sc_0.loadAddress();
    const _creator = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _priceUsdt = sc_1.loadIntBig(257);
    const _listingType = sc_1.loadIntBig(257);
    const _endTime = sc_1.loadIntBig(257);
    return { $$type: 'CreateListing' as const, collectibleId: _collectibleId, nftAddress: _nftAddress, creator: _creator, priceUsdt: _priceUsdt, listingType: _listingType, endTime: _endTime };
}

export function loadTupleCreateListing(source: TupleReader) {
    const _collectibleId = source.readBigNumber();
    const _nftAddress = source.readAddress();
    const _creator = source.readAddress();
    const _priceUsdt = source.readBigNumber();
    const _listingType = source.readBigNumber();
    const _endTime = source.readBigNumber();
    return { $$type: 'CreateListing' as const, collectibleId: _collectibleId, nftAddress: _nftAddress, creator: _creator, priceUsdt: _priceUsdt, listingType: _listingType, endTime: _endTime };
}

export function loadGetterTupleCreateListing(source: TupleReader) {
    const _collectibleId = source.readBigNumber();
    const _nftAddress = source.readAddress();
    const _creator = source.readAddress();
    const _priceUsdt = source.readBigNumber();
    const _listingType = source.readBigNumber();
    const _endTime = source.readBigNumber();
    return { $$type: 'CreateListing' as const, collectibleId: _collectibleId, nftAddress: _nftAddress, creator: _creator, priceUsdt: _priceUsdt, listingType: _listingType, endTime: _endTime };
}

export function storeTupleCreateListing(source: CreateListing) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.collectibleId);
    builder.writeAddress(source.nftAddress);
    builder.writeAddress(source.creator);
    builder.writeNumber(source.priceUsdt);
    builder.writeNumber(source.listingType);
    builder.writeNumber(source.endTime);
    return builder.build();
}

export function dictValueParserCreateListing(): DictionaryValue<CreateListing> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateListing(src)).endCell());
        },
        parse: (src) => {
            return loadCreateListing(src.loadRef().beginParse());
        }
    }
}

export type MarketplaceRoot$Data = {
    $$type: 'MarketplaceRoot$Data';
    owner: Address;
    platformWallet: Address;
    usdtMaster: Address;
}

export function storeMarketplaceRoot$Data(src: MarketplaceRoot$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.platformWallet);
        b_0.storeAddress(src.usdtMaster);
    };
}

export function loadMarketplaceRoot$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _platformWallet = sc_0.loadAddress();
    const _usdtMaster = sc_0.loadAddress();
    return { $$type: 'MarketplaceRoot$Data' as const, owner: _owner, platformWallet: _platformWallet, usdtMaster: _usdtMaster };
}

export function loadTupleMarketplaceRoot$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _platformWallet = source.readAddress();
    const _usdtMaster = source.readAddress();
    return { $$type: 'MarketplaceRoot$Data' as const, owner: _owner, platformWallet: _platformWallet, usdtMaster: _usdtMaster };
}

export function loadGetterTupleMarketplaceRoot$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _platformWallet = source.readAddress();
    const _usdtMaster = source.readAddress();
    return { $$type: 'MarketplaceRoot$Data' as const, owner: _owner, platformWallet: _platformWallet, usdtMaster: _usdtMaster };
}

export function storeTupleMarketplaceRoot$Data(source: MarketplaceRoot$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.platformWallet);
    builder.writeAddress(source.usdtMaster);
    return builder.build();
}

export function dictValueParserMarketplaceRoot$Data(): DictionaryValue<MarketplaceRoot$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMarketplaceRoot$Data(src)).endCell());
        },
        parse: (src) => {
            return loadMarketplaceRoot$Data(src.loadRef().beginParse());
        }
    }
}

 type Listing_init_args = {
    $$type: 'Listing_init_args';
    data: ListingData;
}

function initListing_init_args(src: Listing_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.store(storeListingData(src.data));
    };
}

async function Listing_init(data: ListingData) {
    const __code = Cell.fromHex('b5ee9c7241021d010003e400022cff008e88f4a413f4bcf2c80bed53208e8130e1ed43d90115020271020a02012003050337bb344ed44d0d200018e84db3c6c1f8e86db3c0fd1550de2db3c6cf1816160400022a02012006080337b7ae5da89a1a400031d09b678d83f1d0db6781fa2aa1bc5b678d9e301616070002200337b7b73da89a1a400031d09b678d83f1d0db6781fa2aa1bc5b678d9ff0161609001e547edc547edc547edc547edc547edc0201200b100201200c0e0337b748fda89a1a400031d09b678d83f1d0db6781fa2aa1bc5b678d9e3016160d00022b0337b5347da89a1a400031d09b678d83f1d0db6781fa2aa1bc5b678d9e3016160f00022702012011130337b7995da89a1a400031d09b678d83f1d0db6781fa2aa1bc5b678d9e301616120002240337b4819da89a1a400031d09b678d83f1d0db6781fa2aa1bc5b678d9e3016161400022c04b201d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e84db3c6c1f8e86db3c0fd1550de21110935f0f30e0702fd74920c21f98312fd70b1f57100f925710e2208210bb03c6bdbae3022082104d87b8feba1616171900b0810101d700fa40fa40d401d0fa40d72c01916d93fa4001e201fa40d430d0fa40810101d700810101d700d430d0810101d700d200810101d700d72c01916d93fa4001e201d430d0810101d700810101d7003010cf10ce10cd01fe303e8177435003f2f4810946f8422bc705f2f47070c882105fcc3d1401cb1f7001cb3f2ccf162ccf16ca0082080f4240fa02ca00c9820afaf0807f2d037050346d036d5520c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010bd10ac109b108a107918013210681057104610351024705034c87f01ca0055e0db3cc9ed541c03a0e302c0000fc1211fb08e9010ce551bc87f01ca0055e0db3cc9ed54e0328200d397f8422cc705f2f40da47f0da410ce10bd10ac109b108a10791068105710461035103401c87f01ca0055e0db3cc9ed541a1c1c01fc30393d81774358f2f4f842207070c882105fcc3d1401cb1f7001cb3f24cf165004cf1613ca0082080f4240fa0212ca00c9820afaf0807f2d037050346d036d5520c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010bd10ac109b108a09106810571b012a104610351024704344c87f01ca0055e0db3cc9ed541c00b650ef810101cf001cce1ace08c8ce5007206e9430cf84809201cee215ce03c8ce12810101cf00810101cf0002c8810101cf0013ca0014810101cf005004206e9430cf84809201cee204c8810101cf0015810101cf0013cd12cdcdcd65f6eeb7');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initListing_init_args({ $$type: 'Listing_init_args', data })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const Listing_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    2374: { message: "Not seller" },
    30531: { message: "Listing not active" },
    50507: { message: "Invalid price" },
    54167: { message: "Only NFT" },
} as const

export const Listing_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Not seller": 2374,
    "Listing not active": 30531,
    "Invalid price": 50507,
    "Only NFT": 54167,
} as const

const Listing_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"EscrowNFT","header":3854535145,"fields":[{"name":"collectibleId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"creator","type":{"kind":"simple","type":"address","optional":false}},{"name":"priceUsdt","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"listingType","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"endTime","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"CancelListing","header":3137586877,"fields":[]},
    {"name":"BuyNFT","header":1300740350,"fields":[]},
    {"name":"NftTransfer","header":1839186871,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":false}},{"name":"customPayload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forwardAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"ListingData","header":null,"fields":[{"name":"collectibleId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nftAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"seller","type":{"kind":"simple","type":"address","optional":false}},{"name":"creator","type":{"kind":"simple","type":"address","optional":false}},{"name":"buyer","type":{"kind":"simple","type":"address","optional":true}},{"name":"platformWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"usdtMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"priceUsdt","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"listingType","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"endTime","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"active","type":{"kind":"simple","type":"bool","optional":false}},{"name":"highestBid","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"highestBidder","type":{"kind":"simple","type":"address","optional":true}},{"name":"ownershipAssignedCount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"fallbackCount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"Listing$Data","header":null,"fields":[{"name":"data","type":{"kind":"simple","type":"ListingData","optional":false}}]},
    {"name":"CreateListing","header":2029449158,"fields":[{"name":"collectibleId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nftAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"creator","type":{"kind":"simple","type":"address","optional":false}},{"name":"priceUsdt","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"listingType","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"endTime","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"MarketplaceRoot$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"platformWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"usdtMaster","type":{"kind":"simple","type":"address","optional":false}}]},
]

const Listing_opcodes = {
    "EscrowNFT": 3854535145,
    "CancelListing": 3137586877,
    "BuyNFT": 1300740350,
    "NftTransfer": 1839186871,
    "CreateListing": 2029449158,
}

const Listing_getters: ABIGetter[] = [
    {"name":"is_active","methodId":122058,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"get_seller","methodId":123916,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"get_price","methodId":108963,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_creator","methodId":105031,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"get_listing_data","methodId":97721,"arguments":[],"returnType":{"kind":"simple","type":"ListingData","optional":false}},
    {"name":"get_fallback_count","methodId":89458,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_buyer","methodId":78660,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":true}},
]

export const Listing_getterMapping: { [key: string]: string } = {
    'is_active': 'getIsActive',
    'get_seller': 'getGetSeller',
    'get_price': 'getGetPrice',
    'get_creator': 'getGetCreator',
    'get_listing_data': 'getGetListingData',
    'get_fallback_count': 'getGetFallbackCount',
    'get_buyer': 'getGetBuyer',
}

const Listing_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"CancelListing"}},
    {"receiver":"internal","message":{"kind":"typed","type":"BuyNFT"}},
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"any"}},
]


export class Listing implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = Listing_errors_backward;
    public static readonly opcodes = Listing_opcodes;
    
    static async init(data: ListingData) {
        return await Listing_init(data);
    }
    
    static async fromInit(data: ListingData) {
        const __gen_init = await Listing_init(data);
        const address = contractAddress(0, __gen_init);
        return new Listing(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new Listing(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  Listing_types,
        getters: Listing_getters,
        receivers: Listing_receivers,
        errors: Listing_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: CancelListing | BuyNFT | null | Slice) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CancelListing') {
            body = beginCell().store(storeCancelListing(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'BuyNFT') {
            body = beginCell().store(storeBuyNFT(message)).endCell();
        }
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && message instanceof Slice) {
            body = message.asCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getIsActive(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('is_active', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetSeller(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_seller', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetPrice(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_price', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetCreator(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_creator', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetListingData(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_listing_data', builder.build())).stack;
        const result = loadGetterTupleListingData(source);
        return result;
    }
    
    async getGetFallbackCount(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_fallback_count', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetBuyer(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_buyer', builder.build())).stack;
        const result = source.readAddressOpt();
        return result;
    }
    
}