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
      this.ledgers +
      "] -> " +
      this.ledgers.reduce((prev, curr) => prev + curr)
    );
  }
}

/**
 * @DCI-context
 */
export function Test() {
  const FirstRole = { name: "Test" };

  function FirstRole_method() {
    return FirstRole.name;
  }

  console.log(FirstRole.name); // Accessing Role contract outside its own RoleMethods.
  return FirstRole_method();
}
