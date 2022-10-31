/**
 * This is a MoneyTransfer that tests the linter.
 */
const a = 213;
a;

/**
 * @DCI-context
 */
export function MoneyTransfer(
  Source: {
    name: string;
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

  const NEWAMOUNT_test = () => {
    NEWAMOUNT.confirm2();
  };

  function Source_withdraw() {
    Source.decreaseBalance(AMOUNT);
    Source__confirm();
    Source__confirm2();
    Source__confirm3();
    DESTINATION_deposit();
  }

  function Source__confirm() {
    console.log(AMOUNT);
    //NEWAMOUNT.confirm2()
    //this.test();
    NEWAMOUNT_test();
  }

  console.log("in between roles");

  const Source__confirm2 = () => console.log(Source.name);
  const Source__confirm3 = () => {
    console.log(Source__confirm);
  };

  console.log("in between roles");

  const DESTINATION_deposit = () => {
    //console.log(Source.name);
    //Source.decreaseBalance(100);
    //Source__confirm();
    DESTINATION.increaseBalance(AMOUNT);
  };

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
    Source = {
      decreaseBalance: (amount) => {
        amount;
      },
      name: "newSource",
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
  Source_withdraw();

  return {
    start: () => Source_withdraw(),
    //illegalAccess: Source__confirm,
  };
}
