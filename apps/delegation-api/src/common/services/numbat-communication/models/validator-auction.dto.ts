export class DharitrIApiValidatorAuction {
  owner: string;
  numStakedNodes: number;
  nodes: DharitrIApiValidatorAuctionNode[];
}

export class DharitrIApiValidatorAuctionNode {
  blsKey: string;
  qualified: boolean;
}

export class DharitrIApiValidatorAuctionResponse {
  data: {
    auctionList: DharitrIApiValidatorAuction[];
  };
}
