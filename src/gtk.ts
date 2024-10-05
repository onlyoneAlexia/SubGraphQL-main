import { BigInt } from "@graphprotocol/graph-ts"
import { GTK, Approval as ApprovalEvent, Transfer as TransferEvent } from "../generated/GTK/GTK"
import { Token, User, Transfer } from "../generated/schema";


const TOKEN_ADDRESS = "0x804383944275A1Fa7B460286b5e1C4dbF1cE3921";


function getOrCreateUser(userId: string): User {
  let user = User.load(userId);
  if (user == null) {
    user = new User(userId);
    user.balance = BigInt.fromI32(0)
  }
  return user;
}


export function handleTransfer(event: TransferEvent): void {
  // Load or create the token entity
  let token = Token.load(TOKEN_ADDRESS);
  if (token == null) {
    token = new Token(TOKEN_ADDRESS);
    token.totalSupply = BigInt.fromI32(0);
  }

  let fromUser = getOrCreateUser(event.transaction.from.toHex());
  let toUser = getOrCreateUser(event.params.to.toHex());

  fromUser.balance = fromUser.balance.minus(event.params.value)
  toUser.balance = toUser.balance.plus(event.params.value);

  fromUser.save();
  toUser.save();

  let transfer = new Transfer(event.transaction.hash.toHex());
  
  transfer.from = fromUser.id;
  transfer.to = toUser.id;
  transfer.amount = event.params.value;
  transfer.token = token.id;
  transfer.blockNumber = event.block.number;
  transfer.transactionHash = event.transaction.hash;
  transfer.timestamp = event.block.timestamp
  
  transfer.save();
}

