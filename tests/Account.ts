export class Account {
  readonly name: string;
  readonly ledgers: number[];

  constructor(name: string, ledgers: number[] = []) {
    this.ledgers = ledgers;
    this.name = name;
  }

  increaseBalance(amount: number) {
    this.ledgers.push(amount);
  }

  decreaseBalance(amount: number) {
    this.ledgers.push(-amount);
  }

  get balance() {
    return (
      `${this.name}: ` +
      "[" +
      this.ledgers.join(", ") +
      "] -> " +
      this.ledgers.reduce((prev, curr) => prev + curr)
    );
  }
}
