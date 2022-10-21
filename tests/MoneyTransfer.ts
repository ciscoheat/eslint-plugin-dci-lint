/**
 * @DCI-context
 */
export function MoneyTransfer(
  SOURCE: {
    decreaseBalance(amount: number): void;
  },

  DESTINATION: {
    increaseBalance(amount: number): void;
  },

  AMOUNT: number
) {
  const NEWAMOUNT = {
    confirm2: () => console.log(AMOUNT * 2),
  };

  console.log("Before RoleMethods");

  function SOURCE_withdraw() {
    SOURCE.decreaseBalance(AMOUNT);
    SOURCE__confirm();
    DESTINATION_deposit();
  }

  function SOURCE__confirm() {
    console.log(AMOUNT);
    //this.test();
    NEWAMOUNT.confirm2();
  }

  function DESTINATION_deposit() {
    //SOURCE.decreaseBalance(100);
    //SOURCE__confirm();
    DESTINATION.increaseBalance(AMOUNT);
  }

  //SOURCE__confirm();
  SOURCE_withdraw();
}

/**
 * @DCI-context
 */
function PayBills(PAYEE: { name: string }) {
  function PAYEE_reversed() {
    console.log(PAYEE.name.toLocaleUpperCase());
  }

  PAYEE_reversed();

  /**
   * @DCI-context
   */
  function Nested() {
    //
  }

  Nested();
}

PayBills({ name: "Boris" });
