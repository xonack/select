import {
    assert,
    bsv,
    FixedArray,
    hash256,
    method,
    prop,
    PubKey,
    PubKeyHash,
    Ripemd160,
    Sig,
    SmartContract,
    toByteString,
    UTXO,
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
    public select(sig: Sig, winner: PubKeyHash) {
        assert(this.open, 'can`t select winner for closed bounty')
        assert(this.checkSig(sig, this.maker), 'signature check failed')
        this.open = false
        assert(!this.open, 'bounty failed to close')
    }

    getDeployTx(utxos: UTXO[], initBalance: number): bsv.Transaction {
        this.balance = initBalance
        const tx = new bsv.Transaction().from(utxos).addOutput(
            new bsv.Transaction.Output({
                script: this.lockingScript,
                satoshis: initBalance,
            })
        )
        this.lockTo = { tx, outputIndex: 0 }
        return tx
    }

    getSelectTx(
        utxos: UTXO[],
        prevTx: bsv.Transaction,
        nextInst: Select,
        // sig: Sig,
        privateKey: bsv.PrivateKey,
        winner: PubKeyHash
    ): bsv.Transaction {
        const inputIndex = 1
        return (
            new bsv.Transaction()
                .from(utxos)
                .addInputFromPrevTx(prevTx)
                .setOutput(0, (tx: bsv.Transaction) => {
                    nextInst.lockTo = { tx, outputIndex: 0 }
                    return new bsv.Transaction.Output({
                        script: nextInst.lockingScript,
                        satoshis: this.balance,
                    })
                })
                // .setInputScript(inputIndex, (tx: bsv.Transaction) => {
                .setInputScript(
                    {
                        inputIndex,
                        privateKey,
                    },
                    (tx: bsv.Transaction) => {
                        this.unlockFrom = { tx, inputIndex }
                        return this.getUnlockingScript((self) => {
                            self.select(
                                Sig(tx.getSignature(inputIndex) as string),
                                winner
                            )
                        })
                    }
                )
        )
    }
}
