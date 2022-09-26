import * as crypto from "node:crypto";

type Block = {
  index: number;
  timestamp: string;
  proof: number;
  prevHash: string;
};

export class Blockchain {
  public chain: Block[] = [];
  constructor() {
    this.createBlock(1, "0");
  }

  createBlock(proof: number, prevHash: string) {
    const block: Block = {
      index: this.chain.length + 1,
      timestamp: Date.now().toString(),
      proof,
      prevHash,
    };

    this.chain.push(block);
    return block;
  }

  getPreviousBlock() {
    return this.chain.at(-1)!;
  }

  proofOfWork(previousProof: number) {
    let currentProof = 1;

    while (true) {
      const input = currentProof ** 2 - previousProof ** 2;
      const hash = crypto
        .createHash("sha256")
        .update(input.toString())
        .digest("hex");

      if (hash.startsWith("0000")) {
        break;
      }

      currentProof += 1;
    }

    return currentProof;
  }

  hash(block: Block) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(block))
      .digest("hex");
  }

  isChainValid() {
    return this.chain.every((current, index, arr) => {
      if (index === 0) return true;
      const previous = arr[index - 1];

      if (current.prevHash !== this.hash(previous)) return false;

      const currentProof = current.proof;
      const previousProof = previous.proof;

      const input = currentProof ** 2 - previousProof ** 2;
      const hash = crypto
        .createHash("sha256")
        .update(input.toString())
        .digest("hex");

      return hash.startsWith("0000");
    });
  }
}
