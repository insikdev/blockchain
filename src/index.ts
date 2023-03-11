import { Blockchain } from "./blockchain";
import { Crypto } from "./utils";
import express from "express";

if (!process.env.npm_config_argv) {
  throw new Error("Can't find flag");
}

const flag = JSON.parse(process.env.npm_config_argv).original.slice(
  1
) as string[];

const PORT = flag.find((f) => f.includes("port"))?.split("=")[1];
const NAME = flag.find((f) => f.includes("name"))?.split("=")[1];

if (!PORT || !NAME) {
  throw new Error(`Can't find flag ${flag}`);
}
const app = express();
app.use(express.json());

const blockchain = new Blockchain();

app.get("/mine_block", (_, res) => {
  const previous = blockchain.getPreviousBlock();
  const proof = blockchain.proofOfWork(previous.proof);
  const prevHash = Crypto.hash(previous);

  const mineTransaction = { sender: "ROOT", receiver: NAME, amount: 1 };
  blockchain.addTransaction(mineTransaction);

  const block = blockchain.createBlock(proof, prevHash);

  res.json(block);
});

app.get("/get_chain", (_, res) => {
  const response = { chain: blockchain.chain, length: blockchain.chain.length };
  res.json(response);
});

app.post("transaction", (req, res) => {
  const body = req.body;
  if (!body.sender || !body.receiver || !body.amount) {
    return res.status(400).send("Key Error");
  }
  const index = blockchain.addTransaction(body);
  return res.status(201).send(`Will be added block number : ${index}`);
});

app.post("/connect_node", (req, res) => {
  const body = req.body;
  if (!body.nodes) {
    return res.status(400).send("nodes Error");
  }
  body.nodes
    .filter((node: string) => !node.includes(PORT))
    .forEach((node: string) => {
      blockchain.addNode(node);
    });

  const response = { message: "Success", lists: [...blockchain.nodeLists] };
  return res.json(response);
});

app.get("/replace_chain", async (_, res) => {
  const isReplaced = await blockchain.replaceChain();

  if (isReplaced) {
    return res.json({ ok: true, message: "replaced", chain: blockchain.chain });
  }
  return res.send({ ok: false, message: "All good", chain: blockchain.chain });
});

app.listen(PORT, () => {
  console.log(`port : ${PORT} / name : ${NAME}`);
});
