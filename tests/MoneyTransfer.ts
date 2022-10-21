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
  console.log("Before RoleMethods");

  const NEWAMOUNT = {
    confirm2: () => console.log(AMOUNT * 2),
  };

  function NEWAMOUNT_test() {
    NEWAMOUNT.confirm2();
  }

  function SOURCE_withdraw() {
    SOURCE.decreaseBalance(AMOUNT);
    SOURCE__confirm();
    DESTINATION_deposit();
  }

  function SOURCE__confirm() {
    console.log(AMOUNT);
    //NEWAMOUNT.confirm2()
    //this.test();
    NEWAMOUNT_test();
  }

  function DESTINATION_deposit() {
    //SOURCE.decreaseBalance(100);
    //SOURCE__confirm();
    DESTINATION.increaseBalance(AMOUNT);
  }

  //SOURCE.decreaseBalance(100);
  //SOURCE__confirm();
  SOURCE_withdraw();
}

/**
 * @DCI-context
 */
function PayBills(PAYEES: { name: string }[]) {
  function PAYEES_reversed() {
    console.log(PAYEES.map((p) => p.name.toLocaleUpperCase()));
  }

  PAYEES_reversed();

  /**
   * @DCI-context
   */
  function Nested() {
    //
  }

  Nested();
}

PayBills([{ name: "Boris" }]);
