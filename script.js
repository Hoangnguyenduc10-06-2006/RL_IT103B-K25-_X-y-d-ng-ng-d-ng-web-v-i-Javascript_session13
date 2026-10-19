const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

const ALLOWANCE_ECONOMY = 20.0;
const ALLOWANCE_BUSINESS = 30.0;
const OVERWEIGHT_FEE_PER_KG = 50000;

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const ticketList = [
  {
    pnr: "VN101A",
    passengerName: "Nguyen Van An",
    flightNumber: "VN210",
    seatClass: "ECONOMY",
    seatNumber: "12A",
    status: "BOOKED",
    baggageWeight: 0,
    excessFee: 0,
  },
  {
    pnr: "VN102B",
    passengerName: "Tran Thi Binh",
    flightNumber: "VN210",
    seatClass: "BUSINESS",
    seatNumber: "02C",
    status: "BOOKED",
    baggageWeight: 0,
    excessFee: 0,
  },
  {
    pnr: "VN103C",
    passengerName: "Le Hoang Nam",
    flightNumber: "VN210",
    seatClass: "ECONOMY",
    seatNumber: "15D",
    status: "BOOKED",
    baggageWeight: 0,
    excessFee: 0,
  },
  {
    pnr: "VN104D",
    passengerName: "Pham Thu Huong",
    flightNumber: "VN210",
    seatClass: "BUSINESS",
    seatNumber: "01A",
    status: "BOOKED",
    baggageWeight: 0,
    excessFee: 0,
  },
];

function findTicketByPnr(pnr) {
  if (!pnr) return null;
  return (
    ticketList.find(
      (ticket) => ticket.pnr.toLowerCase() === pnr.trim().toLowerCase(),
    ) || null
  );
}

function calculateExcessBaggageFee(seatClass, actualWeight) {
  const allowance =
    seatClass.toUpperCase() === "BUSINESS"
      ? ALLOWANCE_BUSINESS
      : ALLOWANCE_ECONOMY;
  if (actualWeight > allowance) {
    return (actualWeight - allowance) * OVERWEIGHT_FEE_PER_KG;
  }
  return 0;
}

function checkIn(ticket, weight) {
  if (!ticket || ticket.status !== "BOOKED") return false;
  const fee = calculateExcessBaggageFee(ticket.seatClass, weight);
  ticket.baggageWeight = weight;
  ticket.excessFee = fee;
  ticket.status = "CHECKED_IN";
  return true;
}

function displayBoardingPass(ticket) {
  console.log(
    "\n==============================================================",
  );
  console.log("                 BOARDING PASS / THE LEN MAY BAY              ");
  console.log("==============================================================");
  console.log(
    `  Hanh khach   : ${ticket.passengerName.toUpperCase().padEnd(30)} PNR : ${ticket.pnr.padEnd(6)}`,
  );
  console.log(
    `  Chuyen bay   : ${ticket.flightNumber.padEnd(15)} Hang: ${ticket.seatClass.padEnd(10)} Ghe: ${ticket.seatNumber.padEnd(5)}`,
  );
  console.log(
    `  Hanh ly ky gui: ${String(ticket.baggageWeight).padEnd(10)} kg | Phu phi: ${currencyFormatter.format(ticket.excessFee)}`,
  );
  console.log(
    `  Trang thai   : ${ticket.status.padEnd(15)} Cua ra: 04 (Vui long co mat som)`,
  );
  console.log(
    "==============================================================\n",
  );
}

function listTickets() {
  console.log(
    "\n=========================== DANH SACH VE ===========================",
  );
  console.log(
    `${"PNR".padEnd(8)} | ${"Hanh khach".padEnd(20)} | ${"Chuyen".padEnd(8)} | ${"Hang".padEnd(10)} | ${"Ghe".padEnd(6)} | ${"Trang thai".padEnd(12)} | ${"Hanh ly".padEnd(10)}`,
  );
  console.log(
    "--------------------------------------------------------------------",
  );
  ticketList.forEach((t) => {
    const bagInfo = t.baggageWeight > 0 ? `${t.baggageWeight} kg` : "-";
    console.log(
      `${t.pnr.padEnd(8)} | ${t.passengerName.padEnd(20)} | ${t.flightNumber.padEnd(8)} | ${t.seatClass.padEnd(10)} | ${t.seatNumber.padEnd(6)} | ${t.status.padEnd(12)} | ${bagInfo.padEnd(10)}`,
    );
  });
  console.log(
    "====================================================================",
  );
}

async function handleCheckInProcess() {
  const pnr = await askQuestion("\nNhap ma PNR can lam thu tuc: ");
  const ticket = findTicketByPnr(pnr);

  if (!ticket) {
    console.log(`[Loi] Khong tim thay ve voi ma PNR: ${pnr}`);
    return;
  }

  if (ticket.status === "CHECKED_IN") {
    console.log("[Canh bao] Hanh khach nay da hoan tat check-in truoc do.");
    return;
  }

  if (ticket.status === "CANCELLED") {
    console.log("[Loi] Ve nay da bi huy, khong the thuc hien check-in.");
    return;
  }

  const allowance =
    ticket.seatClass.toUpperCase() === "BUSINESS"
      ? ALLOWANCE_BUSINESS
      : ALLOWANCE_ECONOMY;
  console.log(
    `Thong tin ve: ${ticket.passengerName} | Hang: ${ticket.seatClass}`,
  );
  console.log(`Han muc mien cuoc cua hang ve: ${allowance} kg`);

  let weight = -1;
  while (weight < 0) {
    const inputWeight = await askQuestion(
      "Nhap khoi luong hanh ly ky gui (kg, nhap 0 neu chi co xach tay): ",
    );
    const parsed = parseFloat(inputWeight.trim());
    if (isNaN(parsed) || parsed < 0) {
      console.log("[Loi] Khoi luong hanh ly khong hop le hoac bi am.");
    } else {
      weight = parsed;
    }
  }

  const fee = calculateExcessBaggageFee(ticket.seatClass, weight);
  if (fee > 0) {
    console.log(
      `[Canh bao] Hanh ly vuot han muc ${weight - allowance} kg. Phu phi thu them: ${currencyFormatter.format(fee)}`,
    );
    const confirm = await askQuestion("Xac nhan thu tien va xuat the (y/n)? ");
    if (confirm.trim().toLowerCase() !== "y") {
      console.log("Da huy quy trinh check-in.");
      return;
    }
  }

  checkIn(ticket, weight);
  console.log("[Thanh cong] Check-in thanh cong.");
  displayBoardingPass(ticket);
}

async function searchTicketProcess() {
  const keyword = (
    await askQuestion("\nNhap ma PNR hoac ten khach hang can tim: ")
  )
    .trim()
    .toLowerCase();
  let found = false;

  console.log("\n--- KET QUA TIM KIEM ---");
  ticketList.forEach((t) => {
    if (
      t.pnr.toLowerCase().includes(keyword) ||
      t.passengerName.toLowerCase().includes(keyword)
    ) {
      console.log(
        `PNR: ${t.pnr} | Ten: ${t.passengerName} | Chuyen: ${t.flightNumber} | Hang: ${t.seatClass} | Ghe: ${t.seatNumber} | TT: ${t.status} | TL: ${t.baggageWeight} kg | Phu thu: ${currencyFormatter.format(t.excessFee)}`,
      );
      found = true;
    }
  });

  if (!found) {
    console.log(`Khong tim thay ket qua phu hop voi tu khoa: ${keyword}`);
  }
}

async function handleCancelTicketProcess() {
  const pnr = await askQuestion("\nNhap ma PNR cua ve can huy: ");
  const ticket = findTicketByPnr(pnr);

  if (!ticket) {
    console.log("[Loi] Khong tim thay ve.");
    return;
  }

  if (ticket.status === "CANCELLED") {
    console.log("[Canh bao] Ve nay da o trang thai CANCELLED tu truoc.");
    return;
  }

  console.log(
    `Hanh khach: ${ticket.passengerName} - Trang thai hien tai: ${ticket.status}`,
  );
  const confirm = await askQuestion(
    "Ban co chac chan muon huy ve nay? (y/n): ",
  );
  if (confirm.trim().toLowerCase() === "y") {
    ticket.status = "CANCELLED";
    console.log(
      "[Thanh cong] Huy ve thanh cong. Trang thai da chuyen sang CANCELLED.",
    );
  } else {
    console.log("Da huy thao tac.");
  }
}

function printMenu() {
  console.log("\n----------------- QUAY CHECK-IN SAN BAY -----------------");
  console.log("1. Hien thi danh sach ve chuyen bay");
  console.log("2. Tiep nhan check-in, can hanh ly va thu phi");
  console.log("3. Tra cuu ve theo ma PNR hoac ten khach hang");
  console.log("4. Huy ve / Doi trang thai ve");
  console.log("5. Thoat ca lam viec");
  console.log("---------------------------------------------------------");
}

async function main() {
  let choice = 0;
  do {
    printMenu();
    const rawChoice = await askQuestion("Nhap lua chon cua ban (1-5): ");
    choice = parseInt(rawChoice.trim(), 10);

    switch (choice) {
      case 1:
        listTickets();
        break;
      case 2:
        await handleCheckInProcess();
        break;
      case 3:
        await searchTicketProcess();
        break;
      case 4:
        await handleCancelTicketProcess();
        break;
      case 5:
        console.log(
          "\nDa dong phien lam viec tai quay. Ket thuc chuong trinh.",
        );
        rl.close();
        break;
      default:
        console.log(
          "[Loi] Lua chon khong hop le. Vui long chon lai tu 1 den 5.",
        );
    }
  } while (choice !== 5);
}

main();
