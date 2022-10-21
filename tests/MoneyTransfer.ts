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

  // Disable so rebinding works.
  // eslint-disable-next-line dci-lint/immutable-roles
  let NEWAMOUNT: {
    confirm2: () => void;
  } = { confirm2: () => console.log(AMOUNT * 2) };

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

  //AMOUNT = 234;

  function DESTINATION_deposit() {
    //SOURCE.decreaseBalance(100);
    //SOURCE__confirm();
    DESTINATION.increaseBalance(AMOUNT);
  }

  AMOUNT = 123;

  const rebind = () => {
    // Disable so rebinding works
    // eslint-disable-next-line dci-lint/immutable-roles
    NEWAMOUNT = {
      confirm2: () => {
        /* */
      },
    };
    // eslint-disable-next-line dci-lint/immutable-roles
    SOURCE = {
      decreaseBalance: (amount) => {
        amount;
      },
    };
    // eslint-disable-next-line dci-lint/immutable-roles
    DESTINATION = {
      increaseBalance: (amount) => {
        amount;
      },
    };
  };

  /*
  function rebind2() {
    NEWAMOUNT = {
      confirm2: () => {
        //
      },
    };
  }
  */

  rebind();

  //SOURCE.decreaseBalance(100);
  //SOURCE__confirm();
  SOURCE_withdraw();
}
