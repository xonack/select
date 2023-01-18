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
    toByteString
} from "scrypt-ts";
import { UTXO } from '../types'

export class Select extends SmartContract {

    private balance: number

    @prop()
    maker: PubKey;

    @prop()
    hunters: FixedArray<PubKeyHash, 3>;

    @prop(true)
    open: boolean;

    @prop(true)
    winner: PubKeyHash;

    constructor(maker: PubKey, hunters: FixedArray<PubKeyHash, 3>) {
        super(...arguments);
        this.maker = maker;
        this.hunters = hunters;
        this.open = true;
        this.winner = Ripemd160(toByteString('00'));
    }

    // @method()
    // public select(sig: Sig, winner: PubKeyHash) { 
    //     assert(this.open, 'can`t select winner for closed bounty');
    //     assert(this.checkSig(sig, this.maker), 'only bounty maker can select winner - check signature')
    //     let isHunter = false;
    //     for(let i = 0; i < 3; i++) {
    //         if(this.hunters[i] === winner){
    //             isHunter = true;
    //         }
    //     }
    //     assert(isHunter, 'selected winner did not submit content for the bounty');
    //     this.winner = winner;
    //     // TODO send amount to winner
    //         // create output for a P2PKH to winner
    //     // close bounty
    //     this.open = false; 
    //     assert(!this.open, 'bounty failed to close')
    //     assert(this.ctx.hashOutputs == hash256(this.buildStateOutput(this.ctx.utxo.value)), 'not paying fee from utxos');
    // }

    @method()
    public select() { 
            assert(this.open, 'can`t select winner for closed bounty');
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
        sig: Sig,
        winner: PubKeyHash,
    ): bsv.Transaction {
        const inputIndex = 0;
        return new bsv.Transaction()
            .from(utxos)
            .addInputFromPrevTx(prevTx)
            .setOutput(0, (tx: bsv.Transaction) => {
                nextInst.lockTo = { tx, outputIndex: 0 }
                return new bsv.Transaction.Output({
                    script: nextInst.lockingScript,
                    satoshis: this.balance,
                })
            })
            .setInputScript(inputIndex, (tx: bsv.Transaction) => {
                this.unlockFrom = { tx, inputIndex }
                return this.getUnlockingScript((self) => {
                    // self.select(sig, winner);
                    self.select();
                })
            })
    }
}

