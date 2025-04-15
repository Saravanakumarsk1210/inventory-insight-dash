
export interface InventoryItem {
  id: string;
  particulars: string;
  particularId: string;
  manufacturingDate: string;
  expiryDate: string;
  typeOfGood: string;
  quantity: string | number;
  rate: string | number;
  value: string | number;
}

export const inventoryData: InventoryItem[] = [
  {
    id: "1",
    particulars: "Asphyllin LS Drops - 15ml",
    particularId: "LD2902",
    manufacturingDate: "01-Dec-24",
    expiryDate: "31-May-26",
    typeOfGood: "Finished Goods",
    quantity: 4979,
    rate: 12.21,
    value: 60793.59
  },
  {
    id: "2",
    particulars: "Asphyllin-M Oral Suspension - 60ml",
    particularId: "ELM24009",
    manufacturingDate: "01-Jun-24",
    expiryDate: "31-May-26",
    typeOfGood: "Finished Goods",
    quantity: 648,
    rate: 15.25,
    value: 9882
  },
  {
    id: "3",
    particulars: "Asphyllin-M Oral Suspension - 60ml",
    particularId: "ELM24010",
    manufacturingDate: "01-Dec-24",
    expiryDate: "30-Nov-26",
    typeOfGood: "Finished Goods",
    quantity: 4826,
    rate: 15.25,
    value: 73596.5
  },
  {
    id: "4",
    particulars: "Clopikon-A Capsules - 10's",
    particularId: "COF2301",
    manufacturingDate: "01-Jul-23",
    expiryDate: "30-Jun-25",
    typeOfGood: "Finished Goods",
    quantity: 2420,
    rate: 16.71,
    value: 40448.19
  },
  {
    id: "5",
    particulars: "Cofkon D Softgel Capsules - 10's",
    particularId: "CS033",
    manufacturingDate: "01-Dec-24",
    expiryDate: "30-Nov-26",
    typeOfGood: "Finished Goods",
    quantity: 12,
    rate: 9,
    value: 108
  },
  {
    id: "6",
    particulars: "D-Lutin 10 Tablets - 10's",
    particularId: "DUT 2402",
    manufacturingDate: "01-Oct-24",
    expiryDate: "30-Sep-26",
    typeOfGood: "Finished Goods",
    quantity: 4000,
    rate: 75,
    value: 300000
  },
  {
    id: "7",
    particulars: "D-Lutin 10 Tablets - 10's (Ps)",
    particularId: "DUT2401",
    manufacturingDate: "01-Apr-24",
    expiryDate: "31-Mar-26",
    typeOfGood: "Finished Goods",
    quantity: 1,
    rate: 88.33,
    value: 88.33
  },
  {
    id: "8",
    particulars: "D-Lutin 10 Tablets - 4's (Ps)",
    particularId: "DUT 2401",
    manufacturingDate: "01-Apr-24",
    expiryDate: "31-Mar-26",
    typeOfGood: "Finished Goods",
    quantity: 118,
    rate: 88.61,
    value: 10455.98
  },
  {
    id: "9",
    particulars: "Doxybiotic LB Capsules - 10's",
    particularId: "DOLB 2401",
    manufacturingDate: "01-Mar-24",
    expiryDate: "31-Aug-25",
    typeOfGood: "Finished Goods",
    quantity: 1165,
    rate: 16,
    value: 18640
  },
  {
    id: "10",
    particulars: "Escalate 15 Tablets - 10's",
    particularId: "LC24G080A",
    manufacturingDate: "01-Jul-24",
    expiryDate: "30-Jun-26",
    typeOfGood: "Finished Goods",
    quantity: 7035,
    rate: 8.58,
    value: 60349.54
  },
  {
    id: "11",
    particulars: "Gapad-10 Tablets - 10's",
    particularId: "ADT-004",
    manufacturingDate: "01-Apr-24",
    expiryDate: "31-Mar-26",
    typeOfGood: "Finished Goods",
    quantity: 1450,
    rate: 12,
    value: 17400
  },
  {
    id: "12",
    particulars: "Gapad-10 Tablets - 10's (Ps)",
    particularId: "ADT-004",
    manufacturingDate: "01-Apr-24",
    expiryDate: "31-Mar-26",
    typeOfGood: "Finished Goods",
    quantity: 1,
    rate: 11.46,
    value: 11.46
  },
  {
    id: "13",
    particulars: "Gapad-10 Tablets - 4's (Ps)",
    particularId: "ADT-004",
    manufacturingDate: "01-Apr-24",
    expiryDate: "31-Mar-26",
    typeOfGood: "Finished Goods",
    quantity: 330,
    rate: 0,
    value: 0
  },
  {
    id: "14",
    particulars: "Gapad - M Tablets - 10's",
    particularId: "ADT-007",
    manufacturingDate: "01-Oct-24",
    expiryDate: "30-Sep-26",
    typeOfGood: "Finished Goods",
    quantity: 725,
    rate: 15,
    value: 10875
  },
  {
    id: "15",
    particulars: "Ilgov-GM1 Tablets - 10 's",
    particularId: "IGPT2401",
    manufacturingDate: "01-Jun-24",
    expiryDate: "31-May-26",
    typeOfGood: "Finished Goods",
    quantity: 2880,
    rate: 10.5,
    value: 30240
  },
  {
    id: "16",
    particulars: "Ilgov-GM2 Tablets - 10's",
    particularId: "IMPT2401",
    manufacturingDate: "01-Jun-24",
    expiryDate: "31-May-26",
    typeOfGood: "Finished Goods",
    quantity: 3830,
    rate: 12,
    value: 45960
  },
  {
    id: "17",
    particulars: "JABEZ Capsules - 10's",
    particularId: "AYC001",
    manufacturingDate: "01-Mar-24",
    expiryDate: "28-Feb-26",
    typeOfGood: "Finished Goods",
    quantity: 78,
    rate: 31,
    value: 2418
  },
  {
    id: "18",
    particulars: "Lutin 250 Inj - 1ml (TRD)",
    particularId: "CPI240154",
    manufacturingDate: "01-Jan-24",
    expiryDate: "31-Dec-25",
    typeOfGood: "Finished Goods",
    quantity: "5654 amp",
    rate: 14,
    value: 79156
  },
  {
    id: "19",
    particulars: "Lutin 500 Inj - 2ml (TRD)",
    particularId: "CPI 2404350",
    manufacturingDate: "01-Apr-24",
    expiryDate: "31-Mar-26",
    typeOfGood: "Finished Goods",
    quantity: "2155 amp",
    rate: 19,
    value: 40945
  },
  {
    id: "20",
    particulars: "Neptin M Tablets - 10's",
    particularId: "NTPT2401",
    manufacturingDate: "01-Feb-24",
    expiryDate: "31-Jan-26",
    typeOfGood: "Finished Goods",
    quantity: 812,
    rate: 15.5,
    value: 12586
  },
  {
    id: "21",
    particulars: "Neptin M Tablets - 10's",
    particularId: "NTPT2402",
    manufacturingDate: "31-Dec-24",
    expiryDate: "30-Nov-26",
    typeOfGood: "Finished Goods",
    quantity: 4852,
    rate: 15.5,
    value: 75206
  },
  {
    id: "22",
    particulars: "NEU NT 200 Tablets - 10's",
    particularId: "NNT 2401",
    manufacturingDate: "01-Feb-24",
    expiryDate: "31-Jan-26",
    typeOfGood: "Finished Goods",
    quantity: 3250,
    rate: 17.91,
    value: 58193.79
  },
  {
    id: "23",
    particulars: "N-Lutin 100 Soft Gel Capsules - 10's",
    particularId: "CX001",
    manufacturingDate: "01-Dec-24",
    expiryDate: "30-Nov-26",
    typeOfGood: "Finished Goods",
    quantity: 4975,
    rate: 22,
    value: 109450
  },
  {
    id: "24",
    particulars: "N-Lutin 100 Soft Gel Capsules - 10's",
    particularId: "WP 001",
    manufacturingDate: "01-Sep-23",
    expiryDate: "31-Aug-25",
    typeOfGood: "Finished Goods",
    quantity: 425,
    rate: 23,
    value: 9775
  },
  {
    id: "25",
    particulars: "N-Lutin 200 Soft Gel Capsules - 10's",
    particularId: "HH784002",
    manufacturingDate: "01-Nov-24",
    expiryDate: "31-Oct-26",
    typeOfGood: "Finished Goods",
    quantity: 1685,
    rate: 33,
    value: 55605
  },
  {
    id: "26",
    particulars: "N-Lutin 300 SR  Tablets - 10's",
    particularId: "NTU2401",
    manufacturingDate: "01-Jun-24",
    expiryDate: "31-May-26",
    typeOfGood: "Finished Goods",
    quantity: 3186,
    rate: 48,
    value: 152928
  },
  {
    id: "27",
    particulars: "Norifer Injection - 10ml",
    particularId: "ES0625001E",
    manufacturingDate: "01-Jan-25",
    expiryDate: "31-Dec-26",
    typeOfGood: "Finished Goods",
    quantity: 1494,
    rate: 115.07,
    value: 171909.59
  },
  {
    id: "28",
    particulars: "Norifer Injection - 10ml",
    particularId: "ES0924004",
    manufacturingDate: "01-May-24",
    expiryDate: "30-Apr-26",
    typeOfGood: "Finished Goods",
    quantity: 639,
    rate: 145.08,
    value: 92708.25
  }
];
