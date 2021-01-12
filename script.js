'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-01-05T17:01:17.194Z',
    '2021-01-08T20:36:17.929Z',
    '2021-01-09T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    /*
    const now = new Date();
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
    */
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

// FAKE ALWAYS LOGGED IN
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date

    const now = new Date();
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'numeric', // numeric, long, 2-digit
      year: 'numeric',
      // weekday: 'long',
    };
    // const locale = navigator.language; // The language of user's browser

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    /*
    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);

    labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
    */
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add loan date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
// 01. CONVERTING AND CHECKING NUMBERS
// In JS, all numbers are represented internally as floating point numbers (always as decimals)
console.log(23 === 23.0); // This is true

// convert string to number:
console.log(Number('23')); //or
console.log(+'23'); // when JS sees a '+', it will do type cohertion

// Parsing: We can parse a number for a string
console.log(Number.parseInt('30px')); // JS will try to figure out the number in the string, even if there are other words
console.log(Number.parseInt('px30')); // --> NaN!  The string has to start with a number

// The parseInt accepts a second parameter, the Redix, that is the Base of the numerical system we are using
console.log(Number.parseInt('30px', 10)); // Same result
console.log(Number.parseInt('30px', 2)); // Binary

// PARSEFLOAT:
console.log(Number.parseFloat('2.5rem')); // It read the decimal numbers, not only the integers!

// isNaN : To check if any value is NaN (boolean)
console.log(Number.isNaN(20)); // FALSE (it's a number)
console.log(Number.isNaN('20')); // FALSE (it's a string, it's a regular value)
console.log(Number.isNaN(+'20x')); // TRUE, it's not a number
console.log(Number.isNaN(23 / 0)); // FALSE, it gives 'infinity'

// Better method:  isFinite ---> it checks if it is a number
console.log(Number.isFinite(20)); // TRUE, it's a number
console.log(Number.isFinite('20')); // FALSE It's a string
console.log(Number.isFinite(+'20x')); // FALSE
console.log(Number.isFinite(23 / 0)); // FALSE, it's infinity

// If to check integer:
console.log(Number.isInteger(23));
*/

/*
// 02. MATH AND ROUNDING

// SQUARE ROOT: Math.sqrt
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3)); // How to calculate the CUBIC ROOT

// MAX VALUE (Math.max())  -- it does type cohertion but not parsing:
console.log(Math.max(5, 19, 2304, 531, 45425325));
console.log(Math.max(5, 19, 2304, '531', 45425325)); // The same
console.log(Math.max(5, 19, 2304, '531x', 45425325)); // Error, NaN

// MIN VALUE
console.log(Math.min(5, 19, 2304, '531', 45425325));

// Constants:
// Pi greco:
console.log(Math.PI);

// Random:
console.log(Math.trunc(Math.random() * 6) + 1); // Lancio  dado

// Function to create random integers between two values:
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(30, 100));

// ROUNDING
// Rounding Integers:
console.log(Math.trunc(28.1232)); // Arrotonda togliendo tutti i decimali
console.log(Math.round(25.6335)); // Arrotonda al numero più vicino
console.log(Math.floor(25.6335)); // Arrotonda alnumero più basso // Con negative numbers it work gives a more negative integer
console.log(Math.ceil(25.6335)); // Arrotonda al numero più alto

// Rounding decimals --> we have to insert the decimal number in () and call a method on it
console.log((2.7).toFixed(0)); // 3, it's a STRING
console.log((2.7).toFixed(3)); // 2.700, it's a STRING with 3 decimals
console.log((2.345).toFixed(2)); // 2.35, it's a STRING with 2 decimals
console.log(+(2.345).toFixed(2)); // 2.35, it's a NUMBER (converted) with 2 decimals
*/
/*
// 03. THE REMAINDER OPERATOR (%) - it returns the remainder (RESTO) of a division
console.log(5 % 2); // it is 1
console.log(20 % 3); // it is 2

// Check if number is even or odd (pari o dispari):
const isEven = n => n % 2 === 0;
console.log(isEven(8)); // TRUE
console.log(isEven(27)); // FALSE

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
  });
});
*/

/*
// 04. BigInt - special type of integer (ES2020)
// For numbers above the integer limit (2 alla 53)
console.log(2 ** 53 - 1); // Biggest number
console.log(Number.MAX_SAFE_INTEGER); // It's the same.. for number above there can be errors

// BIGINT can be used to store numbers as large as we want
// We have to add a "n" at the end of the number to transform it in big integer:
console.log(1351354849536597443843513944349494n);

// OPERATIONS WITH BIG INTEGERS:
console.log(10000n + 10000n); // The operators work the same as normal numbers
// It's not possible to mix bigInt numbers with regular numbers, we have to conver the normal number in bigInt with the method .bigInt
// exeption: comparison operator and plus operator when working with strings

console.log(20n === 20); // FALSE, because it's not the same type (regular number vs bigInt)

// Division:
console.log(10n / 3n); // --> 3; it gives the closes integer
*/

/*
// 05. CREATING DATES
// First, we need to create a date. Four ways with the NEWDATE constructor and different parameters:
const now = new Date();
console.log(now);

// Parse the date from a date string:
console.log(new Date('Sun Jan 10 2021 13:17:10')); // it parse the time based on this
console.log(new Date('December 24, 2010')); // Manually written
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2087, 10, 19, 15, 23, 5)); // The month is zero based (10 = November)

console.log(new Date(0)); // 1 Gennaio 1970

// Working with dates
const future = new Date(2087, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear()); // It gives back the year
console.log(future.getMonth()); // Month (zero based)
console.log(future.getDate()); // Day of the month
console.log(future.getDay()); // weekday
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString()); // Gives the ISO String
console.log(future.getTime()); // Timestamp! Amount of milliseconds passed from 1 Jan 1970
console.log(new Date(3720090180000)); // We can reverse the timestamp

console.log(Date.now()); // This gives the timestamp of now

// SET Versions of this methods:
future.setFullYear(2040); // This changes the year
console.log(future);
*/

/*
// OPERATIONS WITH DATES
const future = new Date(2087, 10, 19, 15, 23);
console.log(Number(future)); // Date converted to number (timestampin milliseconds)

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

console.log(
  calcDaysPassed(new Date(2037, 3, 27), new Date(2037, 4, 10, 10, 8))
);
*/
/*
// INTERNATIONALIZATION DATES (API)
const now = new Date();
labelDate.textContent = new Intl.DateTimeFormat('en-US').format(now);
*/

/*
// INTERNATIONALIZATION OF NUMBERS
const num = 49446.26;
const options = {
  style: 'currency', // Unit, percent, currency
  unit: 'celsius',
  currency: 'EUR', // Not determined by the locale, only manually!
};

console.log('US: ', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria: ', new Intl.NumberFormat('ar-SY', options).format(num));
*/
/*
// TIMERS
// SETTIMEOUT: Runs one time
// SETINTERVAL: Runs forever each tot. time until we stop it

// setTimeout(() => console.log('Here is your pizza'), 2000); // Code exection does not stop at this time, it continues
setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  'olives',
  'spinach'
);

// We can cancel the settimeout before the termination of the time:

const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

setInterval(function () {
  const now = new Date();
  console.log(now);
}, 1000);
*/
