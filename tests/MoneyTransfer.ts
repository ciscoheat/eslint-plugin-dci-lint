/**
 * This is a file that tests the linter.
 * All comments with no space between // and the end of the line will be
 * tested in a failing test.
 */

const a = 213;
a;

/**
 * @DCI-context
 */
export async function MoneyTransfer(
  Source: {
    name: string;
    decreaseBalance(amount: number): void;
  },

  DESTINATION: {
    increaseBalance(amount: number): void;
  },

  Ledgers: { date: Date; amount: number }[],
  Iter: Iterable<{ date: Date; amount: number }>,

  AMOUNT: number,

  Source2 = {
    name: "ABC",
    decreaseBalance: (amount: number) => {
      amount;
    },
  }
) {
  console.log("Before RoleMethods");

  function Iter_test() {
    for (const obj of Iter) {
      obj.amount;
    }
  }

  function Source2_test() {
    Source2.decreaseBalance(1);
    Iter_test();
    EmptyArray_test();
  }

  const EmptyArray: number[] = [];

  function EmptyArray_test() {
    EmptyArray.push(123);
  }

  const OtherLedgers = [
    {
      date: new Date(),
      currency: "USD",
      amount: 123,
    },
    234,
  ];

  const OtherLedgers_test = () => {
    if (typeof OtherLedgers[0] !== "number")
      console.log(OtherLedgers[0].currency == "USD");
    Source2_test();
    NullRole_name();
  };

  let NullRole: { name: string };
  const NullRole_name = () => NullRole.name;

  const Ledgers_balance = () => {
    OtherLedgers_test();
    return Ledgers.reduce((acc, curr) => acc + curr.amount, 0);
  };

  const DESTINATION_deposit = () => {
    //console.log(Source.name);
    //Source.decreaseBalance(100);
    //Source__confirm();
    Ledgers_balance();
    DESTINATION.increaseBalance(AMOUNT);
  };

  let NEWAMOUNT: Readonly<{
    confirm2: () => void;
    amount: number;
  }> = { confirm2: () => console.log(AMOUNT * 2), amount: 123 };

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
    //NEWAMOUNT.confirm2();
    //this.test();
    NEWAMOUNT_test();
  }

  //console.log("in between same roles");

  const Source__confirm2 = () => console.log(Source.name);
  const Source__confirm3 = () => {
    console.log(Source__confirm);
    Multiple_output();
    //Multiple__private();
  };

  //console.log("in between different roles");

  //let DESTINATION_deposit2 = () => { /**/ };
  //const TEST_noRole = () => { /* */ };

  const Multiple: { test: number } = { test: 123 },
    Multiple_output = () => console.log(Multiple.test),
    Multiple_output2 = () => {
      console.log(AMOUNT);
      Multiple__private();
      _underscore();
      //DESTINATION.increaseBalance(123);
    },
    Multiple__private = () => {
      Multiple_output2();
    };

  AMOUNT = 123;

  const rebind = () => {
    NEWAMOUNT = {
      confirm2: () => {
        /* */
      },
      amount: 456,
    };
    Source = {
      decreaseBalance: (amount) => {
        amount;
      },
      name: "newSource",
    };
    DESTINATION = {
      increaseBalance: (amount) => {
        amount;
      },
    };
    Ledgers = [];

    Source2 = {
      name: "DEF",
      decreaseBalance: (amount: number) => amount,
    };
    //Multiple = {test: 234}
    Iter = [];

    NullRole = { name: "notnull" };
  };

  //function rebind2() { NEWAMOUNT = { confirm2: () => { /**/ }, }; }

  function _underscore() {
    return 123;
  }

  rebind();

  const output = {
    dest: DESTINATION,
    //dest2: DESTINATION.increaseBalance,
  };

  passRoleOn(DESTINATION); //OK
  passRoleOn(DESTINATION, output); //OK
  //passRoleOn(DESTINATION.increaseBalance, 123); //NO
  //passRoleOn(DESTINATION.increaseBalance(123)); //NO

  //SOURCE.decreaseBalance(100);
  //SOURCE__confirm();
  Source_withdraw();

  return {
    start: () => Source_withdraw(),
    //illegalAccess: Source__confirm,
  };
}

function passRoleOn(destination: unknown, other?: unknown) {
  return { destination, other };
}

/**
 * @DCI-context
 * A speaker proclaims a phrase to the world, that dutifully notes it
 */
function HelloWorld(
  Speaker: { phrase: string },
  World: { log: typeof console.log }
) {
  const Speaker_proclaim = () => World_note(Speaker.phrase);

  const World_note = (phrase: string) => World.log(phrase);

  Speaker_proclaim();
}

HelloWorld({ phrase: "Hello, World!" }, console);

/**
 * @DCI-context
 */
export function ParentContext() {
  const FirstRole = { name: "Test" };

  function FirstRole_method() {
    return FirstRole.name;
  }

  //console.log(FirstRole.name);

  return {
    // @DCI-context
    nested(Person: { name: string }) {
      function Person_method() {
        //if(FirstRole.name) return '';
        return FirstRole_method() + Person.name;
      }

      //console.log(Person.name);
      return Person_method();
    },

    /**
     * @DCI-context
     */
    nested2: (Person: { name: string }) => {
      function Person_method() {
        return FirstRole_method() + Person.name;
      }

      //console.log(Person.name)
      return Person_method();
    },
  };
}
