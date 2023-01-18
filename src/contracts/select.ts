import {
    assert,
    FixedArray,
    method,
    prop,
    PubKey,
    PubKeyHash,
    Ripemd160,
    SmartContract,
    toByteString,
} from 'scrypt-ts'

export class Select extends SmartContract {
    private balance: number

    @prop()
    maker: PubKey

    @prop()
    hunters: FixedArray<PubKeyHash, 3>

    @prop(true)
    open: boolean

    @prop(true)
    winner: PubKeyHash

    constructor(maker: PubKey, hunters: FixedArray<PubKeyHash, 3>) {
        super(maker, hunters)
        this.maker = maker
        this.hunters = hunters
        this.open = true
        this.winner = Ripemd160(toByteString('00'))
    }

    @method()
    public select() {
        assert(this.open, 'can`t select winner for closed bounty')
    }
}
