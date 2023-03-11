import { Transaction } from "./transaction";

export class Block {
  index: number;
  timestamp: string;
  proof: number;
  prevHash: string;
  transactions: Transaction[];
}
