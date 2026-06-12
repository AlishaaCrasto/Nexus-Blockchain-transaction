// Demo credentials and seed data for presentation
export const DEMO_USERS = [
  { email: "demo@nexus.in", password: "demo123", name: "Arjun Sharma", role: "user" },
  { email: "admin@nexus.in", password: "admin123", name: "Priya Mehta", role: "admin" },
];

export const DEMO_TRANSACTIONS = [
  {
    id: "tx_001",
    hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    type: "send",
    amount: "0.5",
    amountINR: "38000.00",
    to: "0xAbCd...1234",
    from: "0x4675...77Ef",
    status: "confirmed",
    timestamp: "2026-04-11T13:38:00Z",
    blockNumber: 123457,
    gasUsed: "21000",
    feesINR: "650",
    network: "Sepolia Testnet",
  },
  {
    id: "tx_002",
    hash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
    type: "receive",
    amount: "1.0",
    amountINR: "76000.00",
    to: "0x4675...77Ef",
    from: "0xDeFg...5678",
    status: "pending",
    timestamp: "2026-04-11T12:10:00Z",
    blockNumber: null,
    gasUsed: null,
    feesINR: null,
    network: "Sepolia Testnet",
  },
  {
    id: "tx_003",
    hash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    type: "send",
    amount: "2.5",
    amountINR: "190000.00",
    to: "0xHiJk...9012",
    from: "0x4675...77Ef",
    status: "failed",
    timestamp: "2026-04-10T09:22:00Z",
    blockNumber: 123400,
    gasUsed: "21000",
    feesINR: "650",
    network: "Sepolia Testnet",
  },
  {
    id: "tx_004",
    hash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
    type: "receive",
    amount: "0.25",
    amountINR: "19000.00",
    to: "0x4675...77Ef",
    from: "0xLmNo...3456",
    status: "confirmed",
    timestamp: "2026-04-09T17:45:00Z",
    blockNumber: 123300,
    gasUsed: "21000",
    feesINR: "650",
    network: "Sepolia Testnet",
  },
];

export const SPENDING_DATA = [
  { label: "1/4", value: 45000 },
  { label: "5/4", value: 82000 },
  { label: "8/4", value: 61000 },
  { label: "10/4", value: 95000 },
  { label: "11/4", value: 112000 },
];

export const ETH_TO_INR = 76000;
