# Fuel Box Profit Tracker

Build the Fuel Box Business Management web application:
- Responsive, mobile-first design with bottom navigation on mobile (Home, Clients, Spending, Reports) and clean sidebar layout on desktop/laptop
- Core business rule: Automatic ₹40 profit per box (configurable in Settings, default ₹40; Total Boxes × ₹40 = Total Box Profit calculated automatically throughout)
- Dashboard displaying:
  * Total Amount, Profit, and Spending hero summary cards
  * Key metrics: Total Clients, Total Boxes, Total Payments Received, Profit Per Box (₹40), Total Box Profit, Final Profit/Loss After Spending
  * Quick action buttons: "+ New Client / Payment" and "+ Add Spending"
  * Recent transactions feed and client profitability overview
- Payment & Client flow:
  * Modal/form for New Client / Payment: Client Name, Payment Type (Day, Week, Month), Duration, Number of Boxes (instantly displays Box Profit = Boxes × ₹40), Payment Amount, Date
  * Client list and dedicated Client Detail view: Total Boxes, Total Payment, Box Profit, Direct Spending, Allocated Overall Spending Share, Final Profit/Loss, Profitable vs. Loss badge, and full payment/expense history
- Spending system:
  * 3 spending types: Client Spending (select client), Shop Spending (Vikram, Ajith, Jinto, Others), and Overall Spending
  * Automatic allocation for Overall Spending: divided equally among active clients (e.g. ₹1,000 / 10 active clients = ₹100 share per client)
  * Categories: Non-Veg, Fruits, Vegetables, Paneer, Masala Items, Others
  * Spending dashboard with category totals, type breakdown (Client, Shop, Overall), and transaction logs with edit/delete actions
- Reports section:
  * Filter by Day, Week, Month, and Custom Date Range
  * Overall business report + Client-wise breakdown and comparison table (Boxes, Payments, Box Profit, Spending, Final Profit/Loss)
- Search & filters: by client, shop, category, transaction type, date
- Settings: Business Name, default Profit Per Box (₹40), Currency (INR ₹), Spending Categories, and Shop Accounts
- Start with an empty data state and calculate dashboards from entered records only

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://thefuelbox-profit-tracker.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e5e2d045-b08f-494e-bd01-cce3ade64ab5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
