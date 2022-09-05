const USUAL_TOKEN_ABI = [
  {"constant": true, "inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
];

const version = "v0.0.1";

let rpc_url = ""
let wallet_address = "";
let token_address = "";
let web3;
let executing = false;
let turned_on_switch = false;
let status_messages = [];
let prev_amount = -1;

const se = new Audio('./se.mp3');

window.onload = function() {
  update_user_data_from_input();
  document.getElementById('version').innerText = version;
  setInterval(check_balance, 1000);
}

function update_user_data_from_input() {
  wallet_address = document.getElementById('wallet_address').value;
  token_address = document.getElementById('token_address').value;
  rpc_url = document.getElementById('rpc_url').value;
  web3 = new Web3(new Web3.providers.HttpProvider(rpc_url));
}

function filled_inputs() {
  return wallet_address && token_address && rpc_url;
}

function get_contract_of(address) {
  const token_abi = USUAL_TOKEN_ABI;
  const contract = new web3.eth.Contract(token_abi, address);
  return contract;
}

async function get_balance_of() {
  const contract = get_contract_of(token_address);
  const balance = await contract.methods.balanceOf(wallet_address).call();
  return balance;
}

function play_notification_sound() {
  se.play();
}

function toggle_checker_switch() {
  turned_on_switch = !turned_on_switch;

  update_user_data_from_input();
  if (!filled_inputs()) {
    alert("Please fill all inputs.");
    turned_on_switch = false;
  }

  const button_text = turned_on_switch ? "On" : "Off";
  document.getElementById('toggle_button').innerText = button_text;
  const inputs = document.getElementsByTagName('input');
  if (turned_on_switch) {
    for (const input of inputs) {
      input.setAttribute("disabled", "disabled");
      play_notification_sound();
    }
  } else {
    for (const input of inputs) {
      input.removeAttribute("disabled");
    }
    stop_notification_sound();
  }
}

async function check_balance() {
  try {
    if (turned_on_switch && !executing) {
      executing = true;
      const amount = await get_balance_of();
      update_status("token balance: " + amount);
      if (prev_amount != -1 && amount != prev_amount) {
        update_status("detected token balance changed");
        play_notification_sound();
      }
      prev_amount = amount;
    }
  } catch(e) {
    console.log(e);
    update_status("FAILED: " + e);
  }

  executing = false;
}

function update_status(message) {
  const message_with_date = new Date() + ": " + message;
  console.log(message_with_date);

  status_messages.unshift(message_with_date);
  let merged_message = "";

  const max_count = 30;
  if (status_messages.length > max_count) {
    status_messages.pop();
  }

  for (const status_message of status_messages) {
    merged_message += "<p>" + status_message + "</p>";
  }

  document.getElementById('status_message').innerHTML = merged_message;
}
