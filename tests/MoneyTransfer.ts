export function MoneyTransfer(
  SOURCE: {
    decreaseBalance(amount: number): void;
  },

  DESTINATION: {
    increaseBalance(amount: number): void;
  },

  AMOUNT: number
) {
  /////////////////////////////////////////////////////////

  function SOURCE_withdraw() {
    SOURCE.decreaseBalance(AMOUNT);
    DESTINATION_deposit();
  }

  /////////////////////////////////////////////////////////

  function DESTINATION_deposit() {
    DESTINATION.increaseBalance(AMOUNT);
  }

  SOURCE_withdraw();
}
