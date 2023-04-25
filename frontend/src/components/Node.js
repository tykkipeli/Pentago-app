class Node {
  constructor(move, prev = null, next = null) {
    this.move = move;
    this.prev = prev;
    this.next = next;
  }
}

export default Node;