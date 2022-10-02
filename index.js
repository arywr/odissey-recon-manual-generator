const readline = require("readline");
const xlsx = require("xlsx");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

let merchants;
let rows = [];

rl.question(
  "From where you want to generate? (Development, Staging, Production): ",
  (server) => {
    const srv = server.toLowerCase();
    const workbook = xlsx.readFile(`./config/merchant_${srv}.xlsx`);
    const firstSheet = workbook.SheetNames[0];
    merchants = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheet]);

    // Break Line
    console.log("\n");
    // Break Line

    const merchantList = new Set();
    const productList = new Set();

    const arrM = merchants.filter((el) => {
      const dm = merchantList.has(el.MerchantName);
      merchantList.add(el.MerchantName);
      return !dm;
    });

    const arrP = merchants.filter((el) => {
      const dm = productList.has(el.ProductName);
      productList.add(el.ProductName);
      return !dm;
    });

    console.clear();

    let productText = arrP.map((e, key) => `${key + 1}. ${e.ProductName}\n`);
    productText.push(": ");

    let merchantText = arrM.map((e, key) => `${key + 1}. ${e.MerchantName}\n`);
    merchantText.push(": ");

    rl.question(
      `Choose Product from this list (Number) \n${productText.join("")}`,
      (pValue) => {
        rl.question(
          `\nChoose Merchant from this list (Number) \n${merchantText.join(
            ""
          )}`,
          (mValue) => {
            rl.question(`\nNumber of Transaction (Line): `, (nTrx) => {
              console.clear();
              console.log("Please Wait...");
              for (let i = 0; i < nTrx; i++) {
                rows.push({
                  TrxDate: moment().format("YYYY-MM-DD"),
                  TrxID: `${moment().format("YYYMMDD")}${uuidv4()}`,
                  NominalSettled: Math.floor(
                    Math.random() * (1000000 - 10000 + 1) + 10000
                  ),
                  ProductId: arrP[parseInt(pValue)].ProductID,
                  MerchantID: arrM[parseInt(mValue)].MerchantID,
                  MerchantName: arrM[parseInt(mValue)].MerchantName,
                  MerchantCode: arrM[parseInt(mValue)].MerchantCode,
                  CanRegister: "FALSE",
                  BankCodeKliring: "",
                  BankName: "",
                  AccountNumber: "",
                  AccountName: "",
                });
              }

              const filename = `${moment().format("DD MMM YYYY HH:mm:ss")} | ${
                arrP[parseInt(mValue)].ProductName
              } - ${arrM[parseInt(mValue)].MerchantName} Transaction Data`;

              setTimeout(() => {
                const exported = xlsx.utils.json_to_sheet(rows);
                const newWorkbook = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(
                  newWorkbook,
                  exported,
                  "Transaction Data"
                );

                xlsx.writeFile(newWorkbook, `./out/${filename}.xlsx`);
                console.log(
                  `Success Generated File with Name: ${filename}.xlsx`
                );
              }, 1000);

              rl.close();
            });
          }
        );
      }
    );
  }
);
