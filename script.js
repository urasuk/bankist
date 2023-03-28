'use strict';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.26761, -133.979878878, 79.97, 1300],
  interestRate: 1.2,
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2023-02-17T14:11:59.604Z',
    '2023-02-18T17:01:17.194Z',
    '2023-02-19T20:36:17.929Z',
    '2023-02-20T23:36:17.929Z',
    '2023-02-21T10:51:36.790Z',
  ],
  currency: 'UAH',
  locale: 'uk-UA',
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
  locale: 'pt-PT',
};

const accounts = [account1, account2];

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

const getDaysPassed = function (date) {

  const daysNumber = Math.round(Math.abs(+new Date() - +date) / (1000 * 60 * 60 * 24));
  console.log('daysNumber :', daysNumber);

  return daysNumber < 1 ? 'today' : daysNumber < 2 ? 'yesterday' : daysNumber <= 7 ? `${Math.round(daysNumber)} days ago` : '';
}

const formatMovementDate = function (date, locale) {

  const mov_date = new Date(date);

  const movYear = mov_date.getFullYear();
  const movMonth = `${mov_date.getMonth() + 1}`.padStart(2, '0');
  const movDay = `${mov_date.getDate()}`.padStart(2, '0');
  const movHour = `${mov_date.getHours()}`.padStart(2, '0');
  const movMin = `${mov_date.getMinutes()}`.padStart(2, '0');

  return `${getDaysPassed(mov_date)}  (${new Intl.DateTimeFormat(locale).format(mov_date)})`
}

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  let movs = acc.movements;

  let movementsDates = acc.movementsDates;

  if (sort) {
    const movementsMerged = movs.map((mov, i) => {
      return {
        movementValue: mov,
        movementDate: movementsDates[i]
      }
    }).sort((a, b) => a.movementValue - b.movementValue);

    movementsDates = movementsMerged.map(ob => ob.movementDate);
    movs = movementsMerged.map(ob => ob.movementValue);
  }

  movs.reduce(function (accum, mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1
    } ${type}</div>
        <div class="movements__date">${formatMovementDate(movementsDates[i], acc.locale)}</div>
        <div class="movements__balance">${getFormatLocaleCurrency(accum + mov, acc.currency, acc.locale)}</div>
        <div class="movements__value">${getFormatLocaleCurrency(mov, acc.currency, acc.locale)}</div> 
      </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
    return accum + mov
  }, 0);
};

const getFormatLocaleCurrency = function (amount, userCurrency, locale) {

  const options = {
    style: 'currency',
    currency: userCurrency
  }
  return new Intl.NumberFormat(locale, options).format(amount);
}

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = getFormatLocaleCurrency(acc.balance, acc.currency, acc.locale);

};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
      .filter(mov => mov > 0)
      .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = getFormatLocaleCurrency(incomes, acc.currency, acc.locale);

  const out = acc.movements
      .filter(mov => mov < 0)
      .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = getFormatLocaleCurrency(Math.abs(out), acc.currency, acc.locale);

  const interest = acc.movements
      .filter(mov => mov > 0)
      .map(deposit => (deposit * acc.interestRate) / 100)
      .filter((int, i, arr) => {

        return int >= 1;
      })
      .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = getFormatLocaleCurrency(interest, acc.currency, acc.locale);
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

  displayMovements(acc);

  calcDisplayBalance(acc);

  calcDisplaySummary(acc);
};

let currentAccount, logoutTimerGlobal;

const nowTime = new Date();

const options = {
  hour: 'numeric',
  minute: 'numeric',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'

}

labelDate.textContent = new Intl.DateTimeFormat('uk-UA', options).format(nowTime)

function setLogoutTimer() {
  let logoutTime = 100;

  const tick = function () {
    let min = `${Math.trunc(logoutTime / 60)}`.padStart(2, '0');
    let sec = `${logoutTime % 60}`.padStart(2, '0');
    labelTimer.textContent = `${min}:${sec}`;
    console.log(`${min}:${sec}`);
    --logoutTime;
  };

  tick();

  const logoutInterval = setInterval(() => {

    if (logoutTime === 0) {
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
      clearInterval(logoutInterval);
    }

    tick();

  }, 1000)

  return logoutInterval;
}

btnLogin.addEventListener('click', function (e) {

  e.preventDefault();

  currentAccount = accounts.find(
      acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {

    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    const now = new Date();

    labelDate.textContent = [
      [`${now.getDate()}`.padStart(2, '0'), `${now.getMonth() + 1}`.padStart(2, '0'), now.getFullYear()].join('/'),
      [now.getHours(), now.getMinutes()].join(':')
    ].join(', ');

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      second: 'numeric'
    }
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

    setInterval(() => {
      labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(new Date());
    }, 1000)

    const clock = document.createElement('div');
    document.querySelector('.welcome').append(clock);

    setInterval(() => {
      const now = new Date();
      const hours = `${now.getHours()}`.padStart(2, '0');
      const minutes = `${now.getMinutes()}`.padStart(2, '0');
      const seconds = `${now.getSeconds()}`.padStart(2, '0');

      clock.textContent = `${hours}:${minutes}:${seconds}`

    }, 1000)

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    updateUI(currentAccount);

    logoutTimerGlobal && clearInterval(logoutTimerGlobal);
    logoutTimerGlobal = setLogoutTimer();
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
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

    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    const transferDate = new Date();
    currentAccount.movementsDates.push(transferDate.toISOString());
    console.log(typeof currentAccount.movementsDates.at(-1));
    receiverAcc.movementsDates.push(transferDate.toISOString());
    console.log(typeof currentAccount.movementsDates.at(-1));

    updateUI(currentAccount);

    clearInterval(logoutTimerGlobal);
    logoutTimerGlobal = setLogoutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  console.log(inputLoanAmount.value);
  console.log('amount :', amount);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {

    setTimeout(function () {

      currentAccount.movements.push(amount);

      currentAccount.movementsDates.push(new Date().toISOString());
      console.log(typeof currentAccount.movementsDates.at(-1));

      updateUI(currentAccount);

    }, 3000);

    clearInterval(logoutTimerGlobal);
    logoutTimerGlobal = setLogoutTimer();
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
      inputCloseUsername.value === currentAccount.username &&
      Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
        acc => acc.username === currentAccount.username
    );
    console.log(index);

    accounts.splice(index, 1);

    containerApp.style.opacity = 0;
    labelWelcome.textContent = `Log in to get started`;

    clearInterval(logoutTimerGlobal);
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});


const randomInt = (min, max) => {

  if (max < min) {
    [max, min] = [min, max];
  }

  return Math.floor(Math.random() * (max - min + 1)) + min

}


labelBalance.addEventListener('click', () => {
  [...document.querySelectorAll('.movements__row')].
  forEach((row, i) => {
    console.log(row);
    (i % 2 === 0) && (row.style.backgroundColor = '#FFF0F5');
    (i % 3 === 0) && (row.style.backgroundColor = '#008080');
  })
})

