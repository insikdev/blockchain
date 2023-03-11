import axios from "axios";
import { Block, Transaction } from "./models";
import { Crypto } from "./utils";

export class Blockchain {
  public chain: Block[] = [];
  public transactions: Transaction[] = [];
  public nodeLists: Set<string> = new Set();

  constructor() {
    this.createBlock(1, "0");
  }

  createBlock(proof: number, prevHash: string) {
    const block: Block = {
      index: this.chain.length + 1,
      timestamp: Date.now().toString(),
      proof,
      prevHash,
      transactions: this.transactions,
    };
    this.transactions = [];
    this.chain = [...this.chain, block];
    return block;
  }

  getPreviousBlock() {
    return this.chain.at(-1)!;
  }

  proofOfWork(previousProof: number) {
    let currentProof = 1;

    while (true) {
      const input = currentProof ** 2 - previousProof ** 2;
      const hash = Crypto.hash(input);

      if (hash.startsWith("0000")) {
        break;
      }

      currentProof += 1;
    }

    return currentProof;
  }

  addTransaction({ sender, receiver, amount }: Transaction) {
    const newTransaction: Transaction = { sender, receiver, amount };
    this.transactions = [...this.transactions, newTransaction];
    return this.getPreviousBlock().index + 1;
  }

  addNode(address: string) {
    // const url = new URL(address)
    this.nodeLists.add(address);
  }

  async replaceChain(): Promise<boolean> {
    let longest;
    let max = this.chain.length;

    const result = await Promise.all(
      [...this.nodeLists].map((address) =>
        axios.get<{ length: number; chain: Block[] }>(`${address}/get_chain`)
      )
    ).then((res) => res.map((response) => response.data));

    result.forEach(({ chain, length }) => {
      if (length > max && Blockchain.isChainValid(chain)) {
        max = length;
        longest = chain;
      }
    });

    if (longest != null) {
      this.chain = longest;
      return true;
    }
    return false;
  }

  static isChainValid(chain: Block[]) {
    return chain.every((current, index, arr) => {
      if (index === 0) return true;
      const previous: Block = arr[index - 1];

      if (current.prevHash !== Crypto.hash(previous)) return false;

      const currentProof = current.proof;
      const previousProof = previous.proof;

      const input = currentProof ** 2 - previousProof ** 2;
      const hash = Crypto.hash(input);

      return hash.startsWith("0000");
    });
  }
}
