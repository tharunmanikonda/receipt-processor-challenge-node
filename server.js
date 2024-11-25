const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = 3000;

// Use middleware to parse JSON request bodies
app.use(express.json());

let receipts = {};

// function to calculate points
function calculatePoints(receipt) {
  let points = 0;

  // Rule 1: One point for every alphanumeric character in the retailer name
  const retailerPoints = receipt.retailer.replace(/[^a-zA-Z0-9]/g, "").length;
  points += retailerPoints;
  console.log(`Rule 1: Retailer name points: ${retailerPoints}`);

  // Rule 2: 50 points if the total is a round dollar amount (no cents)
  let totalPoints = 0;
  if (parseFloat(receipt.total) % 1 === 0) {
    totalPoints = 50;
  }
  points += totalPoints;
  console.log(`Rule 2: Round dollar points: ${totalPoints}`);

  // Rule 3: 25 points if the total is a multiple of 0.25
  let multipleOf25Points = 0;
  if (parseFloat(receipt.total) % 0.25 === 0) {
    multipleOf25Points = 25;
  }
  points += multipleOf25Points;
  console.log(`Rule 3: Total multiple of 0.25 points: ${multipleOf25Points}`);

  // Rule 4: 5 points for every two items
  const itemPoints = Math.floor(receipt.items.length / 2) * 5;
  points += itemPoints;
  console.log(`Rule 4: Item count points: ${itemPoints}`);

  // Rule 5: Item length check (if description length is a multiple of 3)
  let itemLengthPoints = 0;
  receipt.items.forEach((item) => {
    const descriptionLength = item.shortDescription.trim().length;
    if (descriptionLength % 3 === 0) {
      itemLengthPoints += Math.ceil(parseFloat(item.price) * 0.2);
    }
  });
  points += itemLengthPoints;
  console.log(`Rule 5: Item length check points: ${itemLengthPoints}`);

  // Rule 6: 6 points if the day in the purchase date is odd
  const purchaseDate = new Date(receipt.purchaseDate + "T00:00:00");

  // Ensure the purchaseDate is valid
  if (isNaN(purchaseDate)) {
    console.log("Invalid purchase date");
    return; // Return early if the date is invalid
  }

  const dayOfMonth = purchaseDate.getDate();
  console.log("month :" + purchaseDate);
  console.log(dayOfMonth);
  // Rule: 6 points if the day in the purchase date is odd
  let oddDayPoints = 0;
  if (dayOfMonth % 2 !== 0) {
    oddDayPoints = 6; // Award points for an odd day
  }

  points += oddDayPoints;
  console.log(
    `Rule 6: Odd day points: ${oddDayPoints} (Day of the month: ${dayOfMonth})`
  );

  // Rule 7: 10 points if the purchase time is between 2:00 PM and 4:00 PM
  const purchaseTime = new Date(`1970-01-01T${receipt.purchaseTime}:00`);
  let timePoints = 0;
  if (purchaseTime.getHours() >= 14 && purchaseTime.getHours() < 16) {
    timePoints = 10;
  }
  points += timePoints;
  console.log(`Rule 7: Purchase time points: ${timePoints}`);

  console.log(`Total points: ${points}`);

  return points;
}

// Endpoint to process receipts
app.post("/receipts/process", (req, res) => {
  const receiptData = req.body;

  // Generate unique ID for the receipt
  const receiptId = uuidv4();

  receipts[receiptId] = receiptData;

  res.json({ id: receiptId });
});

// Endpoint to get points for a specific receipt
app.get("/receipts/:id/points", (req, res) => {
  const receiptId = req.params.id;
  const receipt = receipts[receiptId];

  if (!receipt) {
    return res.status(404).json({ error: "Receipt not found" });
  }

  const points = calculatePoints(receipt);
  res.json({ points });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
